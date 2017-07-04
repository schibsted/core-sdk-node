'use strict';

const SDKError = require('./SDKError');
const base64 = require('base-64');

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
 * Checks if a given value is a string and non-empty
 * @private
 * @param {string} str - the string to check
 * @param {number} [minLength=1] - the minimum length of the string
 * @return {boolean}
 */
function isNonEmptyStr(str, minLength = 1) {
    return typeof str === 'string' && str.length > minLength;
}

/**
 * checks if a given value is an object (but not null)
 * @private
 * @param {any} obj - the value to check
 * @return {boolean}
 */
function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}

/**
 * Checks if a given value is an object with at least one own key
 * @param {any} obj - the value to check
 * @return {boolean}
 */
function isNonEmptyObj(obj) {
    return isObject(obj) && Object.keys(obj).length > 0;
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
 * A factory method that generates a rejected promise with the specified SDKError
 * @param  {string} message - The error message
 * @param  {Number} [code=500] - The error code (typically server error code)
 * @param  {*} [errorObject] - The error object that was returned from the server. Any property
 *         of errorObject object will be copied into this instance of {@link SDKError}
 * @return {Promise}
 */
function newRejectedSDKError(message, code, errorObject) {
    return Promise.reject(new SDKError(message, code, errorObject));
}

module.exports = {
    toBase64, newRejectedSDKError, cloneDefined, isNonEmptyStr, isObject, isNonEmptyObj,
    basicAuthHeader, bearerAuthHeader
};
