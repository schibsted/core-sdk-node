'use strict';

const { name } = require('../package.json');

const debug = require('debug')(name);

/**
 * Represents a SDK error. This is returned from all rejected promises that are returned from an
 * API call.
 * @extends {Error}
 * @property {number} code - the HTTP error code
 */
class SDKError extends Error {
    /**
     * Constructs an SDK error ready to throw
     * @param  {string} message - The error message
     * @param  {Number} [code=500] - The error code (typically server error code)
     * @param  {object} [errorObject] - The error object that was returned from the server. Any property
     *         of errorObject object will be copied into this instance of {@link SDKError}
     */
    constructor(message, code = 500, errorObject) {
        super(message);
        debug(`SDKError ${message} ${code} ${JSON.stringify(errorObject)}`);
        if (typeof errorObject === 'object') {
            // TODO test me
            Object.assign(this, errorObject);
            // errorObject may set the code as well
        }
        this.code = this.code || code;
    }

    /**
     * A factory method that generates a rejected promise with the specified SDKError
     * @param  {string} message - The error message
     * @param  {Number} [code=500] - The error code (typically server error code)
     * @param  {object} [errorObject] - The error object that was returned from the server. Any property
     *         of errorObject object will be copied into this instance of {@link SDKError}
     * @return {Promise}
     */
    static reject(message, code, errorObject) {
        return Promise.reject(new SDKError(message, code, errorObject));
    }

    /**
     * A utility function that throws an SDKError if an assertion fails.
     * It's mostly useful for validating function inputs.
     * @param {boolean} condition - the condition that we're asserting
     * @param  {string} message - The error message
     * @param  {Number} [code=500] - The error code (typically server error code)
     * @param  {object} [errorObject] - The error object that was returned from the server. Any property
     *         of errorObject object will be copied into this instance of {@link SDKError}
     */
    static assert(condition, message = 'Assertion failed', code, errorObject) {
        if (!condition) {
            throw new SDKError(message, code, errorObject);
        }
    }
}

module.exports = SDKError;
