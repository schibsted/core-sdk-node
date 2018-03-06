'use strict';

/**
 * This module contains shared functionality that is used by the rest of the package
 */

const fetch = require('node-fetch');
const querystring = require('querystring');
const base64 = require('base-64');
const { name } = require('../package.json');
const debug = require('debug')(name);
const SDKError = require('./SDKError');
/** Supported methods. If you change this array, consider implementing it in the children of Api too */
const VALID_METHODS = ['GET', 'POST', 'DELETE'];

/**
 * Encodes a string in base64
 * @param  {string} str - input string
 * @return {string} - base64 encoded string
 */
function toBase64(str) {
    return base64.encode(str);
}

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
     * @param  {string} serverUrl - the server hostname and protocol like http://spp.dev
     * @param  {function} logger - logger method, use debug by default
     */
    constructor(serverUrl, logger = debug) {
        this.serverUrl = serverUrl;
        this.logger = logger;
    }

    /**
     * Makes the actual call to the server and deals with headers, data objects and the edge cases.
     * @private
     * @param  {string} method - can be 'GET', 'POST', 'DELETE', etc.
     * @param  {string} pathname - the path to the endpoint like '/api/2/endpoint-name'
     * @param  {Object} [data={}] - data payload (depending on GET/DELETE or POST it may be a query
     *         string or form body)
     * @throws SDKError - if the call can't be made for whatever reason
     * @return {Promise} - A promise that will represent the success or failure of the call
     */
    _call(method, pathname, data = {}) {
        if (typeof method !== 'string') {
            throw new SDKError(`Method must be string but it is "${method}"`);
        }
        if (!VALID_METHODS.includes(method.toUpperCase())) {
            throw new SDKError(`Method must be one of ${VALID_METHODS.join(' | ')} but it is "${method}"`);
        }
        if (typeof pathname !== 'string') {
            throw new SDKError(`Pathname must be string but it is "${pathname}"`);
        }
        // Yes function hoisting is used for callback and it's fine!
        const opt = {
            method,
            headers: this._getAuthHeader()
        };
        let query = '';

        // Cleanup data
        Object.keys(data).forEach(k => {
            if (data[k] === undefined ) {
                delete data[k];
            }
        });

        // If anything remaining in the data object, pass it
        if (Object.keys(data).length) {
            // Assign data based on what type of call it is
            if (method === 'POST') {
                opt.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                opt.body = querystring.stringify(data);
            } else {
                // GET and DELETE use query strings
                query = querystring.stringify(data);
            }
        }

        const fullUrl = this.serverUrl + pathname + query;
        this.logger('Doing a %s to %s', opt.method, fullUrl);
        this.logger('Headers: %O', opt.headers);
        this.logger('Body: %O', opt.body);
        return fetch(fullUrl, opt)
            // TODO decide if this then() needs to handle errors and convert them to SDKError
            .then(response => {
                this.logger('Response came back with code %d (%s)', response.status, response.statusText);
                // The following log is disabled due to a bug in node-fetch implementation
                // debug('Headers: %O', response.headers.get());
                return response.json().then(responseObject => {
                    // TODO we are not handling the case where the body is not json (but can even be successfull)
                    this.logger('Body: %O', responseObject);
                    if (!response.ok) {
                        // status code not in range 200-299
                        throw new SDKError(response.statusText, response.status, responseObject);
                    }
                    return responseObject;
                });
            });
    }

    /**
     * Returns an object that contains the authorization headers for a request
     * @private
     * @return {object} - the header object with one 'Authentication' key and a string value
     */
    _getAuthHeader() {
        return {};
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

module.exports = { toBase64, CoreApi };
