'use strict';

const { CoreApi } = require('../lib/core');
const { expect } = require('chai');

describe('CoreApi', () => {
    let coreApi;

    beforeEach(() => {
        coreApi = new CoreApi();
    });

    it('has the REST methods for get, post and delete', () => {
        expect(coreApi.get).to.be.a('function');
        expect(coreApi.post).to.be.a('function');
        expect(coreApi.delete).to.be.a('function');
    });
});
