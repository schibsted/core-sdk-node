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
        return {
            Authorization: `Bearer ${this.accessToken}`
        };
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
        return super.post('/oauth/token', {
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
            scope
        });
    }

    /**
     * Make a POST request
     * @param  {string} path - the path like '/api/2/endpoint-name'
     * @param  {object} [data] - data payload
     * @return {Promise}
     */
    post(path, data) {
        return super.post(path, data)
            .catch(error => {
                if (error.status === 401 && this.refreshToken) {
                    // TODO we are not passing the optional scope parameter
                    return this._refreshAccessToken().then(() => super.post(path, data));
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
        return super.get(path, data)
            .catch(error => {
                if (error.status === 401 && this.refreshToken) {
                    // TODO we are not passing the optional scope parameter
                    return this._refreshAccessToken().then(() => super.get(path, data));
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
        return super.delete(path, data)
            .catch(error => {
                if (error.status === 401 && this.refreshToken) {
                    // TODO we are not passing the optional scope parameter
                    return this._refreshAccessToken().then(() => super.delete(path, data));
                }
                throw error;
            });
    }
}

module.exports = UserApi;
