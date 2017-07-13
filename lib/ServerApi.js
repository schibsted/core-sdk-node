'use strict';

const { CoreApi, toBase64 } = require('./core');

/**
 * This class handles requests to endpoints that need basic authorization (clientId/clientSecret)
 */
class ServerApi extends CoreApi {
    /**
     * Create an instance of this and pass it to the functions that fetch data from endpoints
     * that require clientId and clientSecret.
     * @param  {string} serverUrl - the server hostname and protocol like http://spp.dev
     * @param  {string} clientId - client secret obtained from self service
     * @param  {string} clientSecret - client secret obtained from self service
     * @param  {function} logger - logger function
     * @return {Promise}
     */
    constructor(serverUrl, clientId, clientSecret, logger) {
        super(serverUrl, logger);
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Generates authorization headers
     * @private
     * @override
     * @return {object} - authorization headers
     */
    _getAuthHeader() {
        const userPass = `${this.clientId}:${this.clientSecret}`;
        return {
            Authorization: `Basic ${toBase64(userPass)}`
        };
    }
}

module.exports = ServerApi;
