// TODO the usage of global is a temporary workatround that needs to be refactored out

'use strict';

/**
 * @module uri
 * This module contains basic functionality to build url's to endpoints.
 */
const {parse, format} = require('url');
const SDKError = require('./SDKError');
const { cloneDefined, urlNormalizer, server } = require('./util');
const { ENDPOINTS } = require('./config');

class Uri {
    /**
     * Abstracts away the uri logic of the SDK
     * @param {object} options - the options that comes directly from SDK
     * @param {string} [options.serverUrl] - see SDK options
     * @param {string} [options.paymentServerUrl] - see SDK options
     * @param {string} [options.client_id] - see SDK options
     * @param {string} [options.redirect_uri] - see SDK options
     */
    constructor(options) {
        const clientIdRedirectUri = {
            client_id: options.client_id,
            redirect_uri: options.redirect_uri
        };
        // For SPiD endpoints that require clientId and redirectUri
        this._spidCR = server(
            urlNormalizer(options.serverUrl || 'LOCAL', ENDPOINTS.SPiD),
            clientIdRedirectUri);

        // For session cluster (has-session)i
        this._hasSessionCR = server(
            urlNormalizer(options.serverUrl || 'LOCAL', ENDPOINTS.SESSION_CLUSTER),
            clientIdRedirectUri);

        // For BFF endpoints that require clientId and redirectUri
        this._bffCR = server(
            urlNormalizer(options.paymentServerUrl || 'LOCAL', ENDPOINTS.BFF),
            clientIdRedirectUri);
    }

    signup(loginType = '', redirectUri) {
        return this._spidCR('bff-oauth/authorize', {
            response_type: 'code',
            scope: 'openid',
            acr_values: loginType,
            redirect_uri: redirectUri
        });
    }

    logout() {
        return this._spidCR('logout', { response_type: 'code' });
    }

    account() {
        return this._spidCR('account/summary', { response_type: 'code' });
    }

    purchaseHistory() {
        return this._spidCR('account/purchasehistory');
    }

    subscriptions() {
        return this._spidCR('account/subscriptions');
    }

    products() {
        return this._spidCR('account/products');
    }

    redeem(voucherCode) {
        return this._spidCR('account/summary', { voucher_code: voucherCode });
    }

    // todo: for now this leads to the same page as signup, some way to swich login tab in UI would be nice
    login(loginType = '', redirectUri) {
        return this._spidCR('bff-oauth/authorize', {
            response_type: 'code',
            scope: 'openid',
            acr_values: loginType,
            redirect_uri: redirectUri
        });
    }

    /**
     * Query session cluster endpoint which is the faster and preferred way
     * @param  {number} [autologin=1] - only 0 or 1 are accepted
     * @throws SDKError if the value for autologin is invalid
     * @return {string} the full url
     */
    sessionCluster(autologin = 1) {
        if (autologin !== 0 && autologin !== 1) {
            throw new SDKError(`Invalid autologin value for sesseionCluster: "${autologin}"`)
        }
        return this._hasSessionCR('rpc/hasSession.js', { autologin });
    }

    /**
     * Query session endpoint
     * @param  {number} [autologin=1] - only 0 or 1 are accepted
     * @throws SDKError if the value for autologin is invalid
     * @return {string} the full url
     */
    session(autologin) {
        if (autologin !== 0 && autologin !== 1) {
            throw new SDKError(`Invalid autologin value for sesseionCluster: "${autologin}"`)
        }
        return this._spidCR('ajax/hasSession.js', { autologin });
    }

    product(productId) {
        return this._spidCR('ajax/hasproduct.js', { product_id: productId });
    }

    subscription(productId) {
        return this._spidCR('ajax/hassubscription.js', { product_id: productId });
    }

    agreement() {
        return this._spidCR('ajax/acceptAgreement.js');
    }

    traits(traits) {
        return this._spidCR('ajax/traits.js', { t: traits });
    }

    purchasePaylink(paylink, redirectUri) {
        return this._bffCR('api/payment/purchase', {
            paylink,
            redirect_uri: redirectUri
        });
    }
}

module.exports = { urlNormalizer, server, Uri };
