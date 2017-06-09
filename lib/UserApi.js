'use strict';

const { CoreApi } = require('./core');

/**
 * This class handles requests to endpoints that need user token authorization
 */
class UserApi extends CoreApi {

    /**
     * Create an instance of this and pass it to the functions that fetch data from endpoints
     * that require user token.
     * @param  {string} serverUrl - the server hostname and protocol like http://spp.dev
     * @param  {string} accessToken - access token obtained from exchanging a code (or user/pass)
     * @param  {string} refreshToken - refresh token is used to get a new access token when needed
     * @return {Promise}
     */
    constructor(serverUrl, accessToken, refreshToken) {
        super(serverUrl);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    /**
     * Generates authorization headers
     * @private
     * @override
     * @return {object} - authorization headers
     */
    _getAuthHeader() {
        const userPass = `${this.credentials.username}:${this.credentials.password}`;
        return {
            Authorization: `Bearer ${userPass}`
        };
    }

    /**
     * Make a POST request
     * @param  {string} path - the path like '/api/2/endpoint-name'
     * @param  {object} [data] - data payload
     * @return {Promise}
     */
    post(path, data) {
        return this.post(path, data)
            .catch(error => {
                // TODO get a new access token and then...
                if (error.status === 401) {
                    return this.post(path, data);
                }
                throw error;
            });
    }

    /**
     * Make a GET request
     * @param  {string} path - the path like '/api/2/endpoint-name'
     * @param  {object} [data] - data payload
     * @return {Promise}
     */
    get(path, data) {
        return this.get(path, data)
            .catch(error => {
                // TODO get a new access token and then...
                if (error.status === 401) {
                    return this.get(path, data);
                }
                throw error;
            });
    }

    /**
     * Make a DELETE request
     * @param  {string} path - the path like '/api/2/endpoint-name'
     * @param  {object} [data] - data payload
     * @return {Promise}
     */
    delete(path, data) {
        return this.delete(path, data)
            .catch(error => {
                // TODO get a new access token and then...
                if (error.status === 401) {
                    return this.delete(path, data);
                }
                throw error;
            });
    }
}

module.exports = UserApi;
