'use strict';

const CoreApi = require('./CoreApi');
const { expect } = require('chai');
const fetch = require('node-fetch');
const { ENDPOINTS } = require('./config');

const serverUrl = 'https://identity-dev.schibsted.com';

describe('CoreApi', () => {

    // TODO this is an integration test
    it('has the REST methods for get, post and delete', () => {
        const coreApi = new CoreApi({
            serverUrl,
            fetch
        });

        expect(coreApi.get).to.be.a('function');
        expect(coreApi.post).to.be.a('function');
        expect(coreApi.delete).to.be.a('function');
    });

    // TODO this is an integration test
    it('can make a call to SPiD', () => {
        const coreApi = new CoreApi({
            serverUrl,
            fetch
        });

        return coreApi.get('/api/2/version').then(
            (version) => {
                expect(version).to.be.an('object');
                expect(version).to.have.property('name');
                expect(version).to.have.property('version');
            }
        );
    });

});
