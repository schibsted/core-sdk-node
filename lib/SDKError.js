'use strict';

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
     * @param  {*} [errorObject] - The error object that was returned from the server. Any property
     *         of errorObject object will be copied into this instance of {@link SDKError}
     */
    constructor(message, code = 500, errorObject) {
        super(message);
        if (errorObject) {
            Object.assign(this, errorObject);
            // errorObject may set the code as well
        }
        this.code = this.code || code;
    }
}

module.exports = SDKError;
