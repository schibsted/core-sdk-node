'use strict';

const EventEmitter = require('eventemitter3');
const jsonpFetch = require('fetch-jsonp');
const { version } = require('../package.json');
const { openPopup, keepPopupFocused } = require('./popup');
const SDKError = require('../lib/SDKError');
const { Uri } = require('../lib/Uri');
const persistence = require('./persistence');

class SDK {
    /**
     * @remark SPiD SDK v2 had a config merge functionality but we delegate it to the caller
     * @throws if the options object is missing or some of its values are invalid
     * @param {object} options
     * @param {string} options.redirect_uri - mandatory redirect uri
     * @param {string} options.client_id - mandatory client id
     * @param {boolean} options.popup - should we use a popup for login?
     * @param {boolean} options.useSessionCluster - should we use the session cluster
     *        (AKA HasSession endpoints)
     * @param {string} options.persistence {@link getPersistenceModule}
     * @param {object} [options.cache] - an object specifiying what to cache in memory
     * @param {object} [options.cache.hasSession] - should we cache hasSession data?
     *        The value is TTL in seconds
     * @param {object} [options.cache.hasProduct] - should we cache hasProduct data?
     *        The value is TTL in seconds
     * @param {object} [options.cache.hasSubscription] - should we cache hasSubscription data?
     *        The value is TTL in seconds
     * @param {string} [options.serverUrl='LOCAL'] - url to SPiD
     *        Some shorthand strings can be used as well: LOCAL, DEV, PRE, PRO, PRO.NO, PRO.COM
     * @param {string} [options.paymentServerUrl='LOCAL'] - url to BFF's checkout flow
     *        Some shorthand strings can be used as well: LOCAL, DEV
     */
    constructor(options) {
        // validate options
        SDKError.assert(isObject(options), 'SDK options must be an object');
        SDKError.assert(isNonEmptyStr(options.client_id), 'client_id parameter is required');
        SDKError.assert(isUrl(options.redirect_uri),
            `redirect_uri parameter is invalid: ${options.redirect_uri}`);
        SDKError.assert(isUrl(options.serverUrl),
            `serverUrl or env parameter is invalid: ${options.serverUrl}`);
        SDKError.assert(isUrl(options.paymentServerUrl),
            `paymentServerUrl or env parameter is invalid: ${options.paymentServerUrl}`);

        // Set minimum refresh timeout
        this.fetch = jsonpFetch;
        this.options = options;
        this.event = new EventEmitter();
        this._sessionInitiatedSent = false;
        this._userStatus = 'unknown';
        if (options.cache) {
            this.cache = new persistence.InMemoryCache();
        }
        // Old session
        this._session = {};
        this.persist = this.getPersistenceModule(options.persistence);
        this.uri = new Uri(options);
        this.event.emit('initialized');
    }

    getPersistenceModule(which = 'localstorage') {
        // TODO this could use heavy refactoring and optimization
        const key = `spid_js_${this.options.client_id}`;
        switch (which) {
            case 'localstorage':
                return new persistence.WebStoragePersistence(key);
            case 'cookie':
                return new persistence.CookiePersistence(key);
            default:
                return new persistence.NullPersistence();
        }
    }

    version() {
        return version;
    }

    clearClientData() {
        this.persist.clear();
        this.cookie.clearVarnishCookie();
    }

    acceptAgreement() {
        return this.fetch(this.uri.agreement())
            .then(() => {
                this.clearClientData();
                return this.hasSession();
            });
    }

    emitSessionEvent(previous, current) {
        // Respons contains a visitor
        if (current.visitor) {
            this.event.emit('visitor', current.visitor);
        }
        // User has created a session, or user is no longer the same
        if (current.userId && previous.userId !== current.userId) {
            this.event.emit('login', current);
        }
        // User is no longer logged in
        if (previous.userId && !current.userId) {
            this.event.emit('logout', current);
        }
        // One user was logged in, and it is no longer the same user
        if (previous.userId && current.userId && previous.userId !== current.userId) {
            this.event.emit('userChange', current);
        }
        // There is a user now, or there used to be a user
        if (previous.userId || current.userId) {
            this.event.emit('sessionChange', current);
        } else {
            // No user neither before nor after
            this.event.emit('notLoggedin', current);
        }
        // Fired when the session is successfully initiated for the first time
        if (current.userId && !this._sessionInitiatedSent) {
            this._sessionInitiatedSent = true;
            this.event.emit('sessionInit', current);
        }
        // Triggered when the userStatus flag in the session has changed
        if (current.userStatus !== this._userStatus) {
            this._userStatus = current.userStatus;
            this.event.emit('statusChange', current);
        }
        // TODO: VGS.loginStatus?
    }

    hasSession() {
        // Try to resolve from cache (it has a TTL)
        const cachedData = this.persist.get();
        if (cachedData) {
            return Promise.resolve(cachedData);
        }
        return this.fetch(this.options.useSessionCluster ?
            this.uri.sessionCluster(1) : this.uri.session(1)
        )
            .catch(err => {
                if (this.options.useSessionCluster && err && err.type === 'LoginException') {
                    // we were trying the session cluster but it failed, let's try the PHP endpoint
                    this.event.emit('loginException');
                    // Fallback to core
                    // TODO what if the first call was already to cors ha? :) Double-call?
                    return this.fetch(this.uri.session(1));
                }
                throw new SDKError(err);
            })
            .then(response => response.json())
            .then(data => {
                // TODO shouldn't it be `&&` instead of `||` ?
                if (data.result || (this.options.cache && this.options.cache.hasSession)) {
                    // TODO maybe the persist classes themselves should fallback to TTL smartly?
                    this.persist.set(data, data.expiresIn || this.options.cache.hasSessionTTL);
                }
                this.emitSessionEvent(this._session, data);
                this._session = data;
            },
            err => this.event.emit('error', err)
        );
    }

    hasProduct(productId) {
        const cacheKey = `prd_${productId}`;
        if (this.cache) {
            const cachedVal = this.cache.get(cacheKey);
            return Promise.resolve(cachedVal);
        }
        return this.fetch(this.uriBuilder.product(productId))
            .then(data => {
                if (data.result) {
                    if (this.cache) {
                        this.cache.set(cacheKey, data, this.cache.hasProduct);
                    }
                    this.event.emit('hasProduct', {
                        productId,
                        result: data.result
                    });
                }
            });
    }

    hasSubscription(productId) {
        const cacheKey = `pub_${productId}`;
        if (this.cache) {
            const cachedVal = this.cache.get(cacheKey);
            return Promise.resolve(cachedVal);
        }
        return this.fetch(this.uri.subscription(productId))
            .then(data => {
                if (data.result) {
                    if (this.cache) {
                        this.cache.set(cacheKey, data, this.cache.hasSubscription);
                    }
                    this.event.emit('hasSubscription', {
                        // TODO Would be nicer if we returned productId instead of subscriptionId
                        subscriptionId: productId,
                        result: data.result
                    });
                }
            });
    }

    setTraits(traits) {
        return this.fetch(this.uri.traits(traits));
    }

    /**
     * Tries to open a popup (if the config asked for it) and if it fails, it uses the redirect
     * flow. If it opens a popup, it tries to keep it on the top by periodically trying to focus it.
     * @param {string} title - the popup window title
     * @param {string} popupUrl - a url that will be used for the popup
     * @param {string} [redirectUrl=popupUrl] - a url that will be used for the redirect flow.
     *         Defaults to the same url as for the popup
     * @return {Window} a reference to the popup window
     */
    _openPopupOrRedirect(title, popupUrl, redirectUrl = popupUrl) {
        if (this.options.popup) {
            if (this._lastPopupRef && typeof this._lastPopupRef.close === 'function') {
                this._lastPopupRef.close();
            }
            const popupRef = openPopup(popupUrl, title);
            if (popupRef) {
                this._lastPopupRef = popupRef;
                keepPopupFocused(popupRef);
                return popupRef;
            }
        }
        // if popup is disabled or we failed to show the popup use the redirect flow
        window.location = redirectUrl;
        return window;
    }

    /**
     * @remark in order to work correctly this function needs to be called in response to a user
     * even (like click or tap) otherwise the popup will be blocked by the browser's popup blockers
     * and has to be explicitly authorized to be shown.
     * @param {string} [loginType=''] - Authentication Context Class Reference Values
     *        '' (empty string) means username/password login
     *        'otp-email' means one time password using email
     *        'otp-sms' means one time password using sms
     * @param {string} [redirectUri] - redirection uri that will receive the code
     */
    login(loginType, redirectUri) {
        return this._openPopupOrRedirect('Login', this.uri.login(loginType, redirectUri));
    }

    logout(redirectUri) {
        return this.fetch(this.uri.logout(redirectUri))
            .then((data) => {
                this.clearClientData();
                this.event.emit('logout', data);
            });
    }

    payment(paylink, redirectUri = null) {
        return this._openPopupOrRedirect('Purchase',
            this.uri.purchasePaylink(paylink, redirectUri));
    }

}

module.exports = SDK;
