'use strict';

const { parse } = require('url');
const { TOKEN } = require('./config');

/**
 * Checks if a given value is a string and non-empty
 * @private
 * @param {*} value - the string to check
 * @param {number} [minLength=1] - the minimum length of the string (inclusive)
 * @param {number} [maxLength] - if specified, checks the maximum length of the string (inclusive)
 * @return {boolean}
 */
function isNonEmptyStr(value, minLength = 1, maxLength) {
    return typeof value === 'string' &&
        value.length >= minLength &&
        (maxLength ? value.length <= minLength : true);
}

/**
 * checks if a given value is an object (but not null)
 * @private
 * @param {*} value - the value to check
 * @return {boolean}
 */
function isObject(value) {
    return typeof value === 'object' && value !== null;
}

/**
 * Checks if a given value is an object with at least one own key
 * @param {*} value - the value to check
 * @return {boolean}
 */
function isNonEmptyObj(value) {
    return isObject(value) && Object.keys(value).length > 0;
}

/**
 * Checks if a given string is a valid URL
 * TODO test me
 * @param {*} value - the string to be tested
 * @return {boolean}
 */
function isUrl(value) {
    try {
        const result = parse(value);
        return true;
    } catch (urlParsingError) {
        return false;
    }
}

/**
 * Checks if a given value is a function
 * TODO test me
 * @param {*} value
 * @return {boolean}
 */
function isFunction(value) {
    return typeof value === 'function';
}

/**
 * Checks if a given value is a valid token
 * TODO test me
 * @param {*} value
 */
function isToken(value) {
    return isNonEmptyStr(value, TOKEN.MIN, TOKEN.MAX);
}

module.exports = { isNonEmptyStr, isObject, isNonEmptyObj, isUrl, isFunction, isToken };
