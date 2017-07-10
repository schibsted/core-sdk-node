'use strict';

const { parse } = require('url');

/**
 * Checks if a given value is a string and non-empty
 * @private
 * @param {*} value - the string to check
 * @param {number} [minLength=1] - the minimum length of the string
 * @return {boolean}
 */
function isNonEmptyStr(value, minLength = 1) {
    return typeof value === 'string' && value.length > minLength;
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
 * @param {*} value
 * @return {boolean}
 */
function isFunction(value) {
    return typeof value === 'function';
}

module.exports = { isNonEmptyStr, isObject, isNonEmptyObj, isUrl, isFunction };
