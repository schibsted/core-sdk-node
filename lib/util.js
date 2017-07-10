'use strict';

const SDKError = require('./SDKError');
const base64 = require('base-64');
const { parse, format } = require('url');
const { isNonEmptyStr, isObject, isNonEmptyObj, isUrl } = require('./validate');

/**
 * Encodes a string in base64
 * @param  {string} str - input string
 * @return {string} - base64 encoded string
 */
function toBase64(str) {
    if (typeof str !== 'string') {
        throw new SDKError(`Cannot encode a non-string value to base-64: "${str}"`);
    }
    return base64.encode(str);
}

/**
 * Similar to Object.assign({}, src) but only
 * clones the keys of an object that have non-undefined values.
 * @private
 * @param {object} src
 * @return {object} a new object that is similar to src with all the key/values where value is
 *         undefined are removed.
 */
function cloneDefined(src) {
    const dest = {};
    if (isNonEmptyObj(src)) {
        Object.keys(src).forEach(k => {
            if (src[k] !== undefined ) {
                dest[k] = src[k];
            }
        });
    }
    return dest;
}

/**
 * Generates authorization headers
 * BUG: if the user ' ', we don't throw.
 * @private
 * @override
 * @return {object} - authorization headers
 */
function basicAuthHeader(user, pass) {
    if (!isNonEmptyStr(user)) {
        throw new SDKError(`User should be a non-empty string but is "${user}"`);
    }
    if (typeof pass !== 'string') {
        throw new SDKError(`Password should be string but it is of type ${typeof pass}`);
    }
    return `Basic ${toBase64(user + ':' + pass)}`;
}

/**
 * Generates authorization headers
 * BUG: if the token is ' ', we don't throw.
 * @private
 * @override
 * @return {object} - authorization headers
 */
function bearerAuthHeader(token) {
    if (!isNonEmptyStr(token)) {
        throw new SDKError(`Token should be a non-empty string but is of type ${typeof token}`);
    }
    return `Bearer ${token}`;
}

/**
 * A simple utility function that allows passing shorthands from a dictionary
 * @private
 * @param {string} hostname - a hostname like http://example.com
 * @param {object} hostnameShorthands - an object of shorthands like { dev: 'http://dev.example.com' }
 * @throws SDKError if the hostname is not an string or is an empty string
 */
function urlNormalizer(hostname, hostnameShorthands = {}) {
    if (typeof hostname !== 'string' || hostname === '') {
        throw new SDKError(`"hostname" param must be a non empty string but it is ${typeof hostname}`);
    }
    return hostnameShorthands[hostname] || hostname;
}

/**
 * Builds a URI to an endpoint (for both flow endpoints or api endpoints) to a server.
 * Creates a URL builder. The terminology used here is similar to the Node's URL documentations
 * @private
 * @see https://nodejs.org/api/url.html#url_url_strings_and_url_objects
 * @param {string} hostName - it is either env name LOCAL|DEV|PRE|PRO|PRO.NO|PRO.COM or the host name of the server (including port number if it's different from 80)
 * @param {object} defaultParams - a map of params that will be added to all urls as query string
 * @param {string} defaultParams.client_id - client id that is mandatory for most URLs
 * @param {object} defaultParams.redirect_uri - redirect uri that is mandatory for most URLs
 * @param {object} hostnameShorthands - an optional dictionary that will be used to give shorter names to serverUrls
 */
function server(hostName, defaultParams = {}) {
    const { protocol, hostname, port } = parse(hostName);
    return function formatUrl(pathname = '', params = {}) {
        const query = Object.assign({}, cloneDefined(defaultParams), cloneDefined(params));
        return format({ protocol, hostname, port, query, pathname });
    }
}

module.exports = { toBase64, cloneDefined, basicAuthHeader, bearerAuthHeader, urlNormalizer, server };
