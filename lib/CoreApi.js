'use strict';

/**
 * This module contains shared functionality that is used by the rest of the package
 */

const fetch = require('node-fetch');
const querystring = require('querystring');
const { name } = require('../package.json');
const debug = require('debug')(name);
const { isNonEmptyObj, isNonEmptyStr, isUrl, isFunction, isToken } = require('./validate');
const { basicAuthHeader, bearerAuthHeader, cloneDefined } = require('./util');
const SDKError = require('./SDKError');

/**
 * Supported methods. If you change this array, consider implementing it in the children
 * of Api too
 */
const VALID_METHODS = ['GET', 'POST', 'DELETE'];


/**
 * This class handles the mundane task of making the API calls.
 * It is used as a base class for the other API handers like {@link UserApi} and
 * {@link ServerApi} that handle the calls to authorized end points.
 * Read some general points about API endpoints @see http://techdocs.spid.no/endpoints/
 * @alias OpenApi
 */
class CoreApi {

    /**
     * Creates a class that handles API calls
     * @param {object} options - see below
     * @param {string} options.serverUrl - the server hostname and protocol like http://spp.dev
     * @param {function} options.fetch - a reference to fetch. For example browser's native implementation,
     *        a polyfill or node-fetch
     * @param {object} [options.credentials] - an object that describes HTTP Basic authentication
     *        credentials.
     * @param {string} [options.credentials.clientId] - the client id. If this is present,
     *        clientSecret must also be present.
     * @param {string} [options.credentials.clientSecret] - client secret. If this is present,
     *        clientId must also be present.
     * @param {string} [options.token.access] - the access token. If this is present, an optional
     *        refreshToken can exist too.
     *        note that if the refreshToken is provided the value of access token will be
     *        automatically updated in the object passed to this parameter.
     * @param {string} [options.token.refresh] - the refresh token. If access token is missing, the
     *        refresh token must be present.
     * @throws SDKError when validating the options
     */
    constructor({ serverUrl, auth, fetch, credentials, token }) {
        SDKError.assert(isUrl(serverUrl), `serverUrl is not a valid URL: ${serverUrl}`);
        SDKError.assert(isFunction(fetch), 'fetch is not a function');
        this.serverUrl = serverUrl;
        this.fetch = fetch;
        if (isNonEmptyObj(credentials)) {
            SDKError.assert(isNonEmptyStr(credentials.clientId),
                `Bad clientId: ${credentials.clientId}`);
            SDKError.assert(isNonEmptyStr(credentials.clientSecret),
                `Bad clientSecret: ${credentials.clientSecret}`);
            this.credentials = credentials;
        } else if (isNonEmptyObj(token)) {
            SDKError.assert(isToken(token.access) || isToken(token.refreh),
                'At least one of access token or refresh token must be passed');
            this.token = token;
        }
    }

    /**
     * Update the access token using the refresh token
     * @see https://tools.ietf.org/html/rfc6749#section-6
     * @private
     * @param {string} [scope] The scope of the access request as described by
     *        https://tools.ietf.org/html/rfc6749#section-3.3.  The requested scope MUST NOT include
     *        any scope not originally granted by the resource owner, and if omitted is treated as
     *        equal to the scope originally granted by the resource owner.
     * @return {Promise}
     */
    _refreshAccessToken(scope) {
        SDKError.assert(isNonEmptyObj(this.token));
        SDKError.assert(isToken(this.token.refreh));

        // TODO there's a risk for creating a loop here
        return this._call('post', '/oauth/token', {
            grant_type: 'refresh_token',
            refresh_token: this.token.refresh,
            scope
        }, false);
    }

    /**
     * Makes the actual call to the server and deals with headers, data objects and the edge cases.
     * @private
     * @param {string} method - can be 'GET', 'POST', 'DELETE', etc. case sensitive.
     * @param {string} pathname - the path to the endpoint like '/api/2/endpoint-name'
     * @param {Object} [data={}] - data payload (depending on GET/DELETE or POST it may be a query
     *        string or form body)
     * @param {boolean} [retry=true] - in case of a 401 error if the refreshToken is provided,
     *        should we retry or not?
     * @throws SDKError - if the call can't be made for whatever reason
     * @return {Promise} - A promise that will represent the success or failure of the call
     */
    _call(method, pathname, data = {}, retry = true) {
        SDKError.assert(isNonEmptyStr(method),
            `Method must be a non empty string but it is "${method}"`);
        SDKError.assert(VALID_METHODS.includes(method),
            `Method must be one of ${VALID_METHODS.join(' | ')} but it is "${method}"`);
        SDKError.assert(isNonEmptyStr(pathname),
            `Pathname must be string but it is "${pathname}"`);
        const opt = { method };
        if (this.credentials) {
            opt.headers = { Authorization: basicAuthHeader(
                this.credentials.clientId, this.credentials.clientSecret) };
        }
        if (this.token) {
            opt.headers = { Authorization: bearerAuthHeader(this.token.access) };
        }

        let query = '';

        // Cleanup data
        const payload = cloneDefined(data);

        // If anything remaining in the payload object, pass it
        if (isNonEmptyObj(payload)) {
            // Assign payload based on what type of call it is
            if (method === 'POST') {
                opt.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                opt.body = querystring.stringify(payload);
            } else {
                // GET and DELETE use query strings
                query = querystring.stringify(payload);
            }
        }

        // TODO use URL https://nodejs.org/api/url.html#url_class_url then we can get rid
        // of querystring
        const fullUrl = this.serverUrl + pathname + query;
        debug('Doing a %s to %s', opt.method, fullUrl);
        debug('Headers: %O', opt.headers);
        debug('Body: %O', opt.body);
        return this.fetch(fullUrl, opt)
            // TODO decide if this then() needs to handle errors and convert them to SDKError
            .catch(error => {
                // TODO there's a risk of getting stuck in a loop
                if (error.status === 401 && this.refreshToken && retry) {
                    // TODO we are not passing the optional scope parameter
                    return this._refreshAccessToken().then(() => this.fetch(fullUrl, opt, false));
                }
                throw error;
            })
            .then(response => {
                debug('Response came back with code %d (%s)', response.status, response.statusText);
                // The following log is disabled due to a bug in node-fetch implementation
                // debug('Headers: %O', response.headers.get());
                return response.json().then(responseObject => {
                    // TODO we are not handling the case where the body is not json (but can even
                    // be successfull)
                    debug('Body: %O', responseObject);
                    if (!response.ok) {
                        // status code not in range 200-299
                        throw new SDKError(response.statusText, response.status, responseObject);
                    }
                    return responseObject;
                });
            });
    }

    /**
     * Make a POST request
     * @param  {string} path - the path like '/api/2/endpoint-name'
     * @param  {object} [data] - data payload
     * @return {Promise}
     */
    post(path, data) {
        return this._call('POST', path, data);
    }

    /**
     * Make a GET request
     * @param  {string} path - the path like '/api/2/endpoint-name'
     * @param  {object} [data] - data payload
     * @return {Promise}
     */
    get(path, data) {
        return this._call('GET', path, data);
    }

    /**
     * Make a DELETE request
     * @param  {string} path - the path like '/api/2/endpoint-name'
     * @param  {object} [data] - data payload
     * @return {Promise}
     */
    delete(path, data) {
        return this._call('DELETE', path, data);
    }
}

module.exports = CoreApi;
