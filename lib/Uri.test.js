'use strict';

const { URL } = require('url');
const { expect } = require('chai');
const { Uri } = require('./Uri');

/**
 * A test utility function for checking the query parameters against an expected object
 * @param {URLSearchParams} searchParams
 * @param {object} expectedParams - a hash that represents the expected key&value params
 */
function checkSearchParams(searchParams, expectedParams) {
    Object.keys(expectedParams)
        .forEach(key => expect(searchParams.get(key)).to.equal(expectedParams[key], `${key} param`));
}

describe('Uri', () => {

    describe('login', () => {

        it('returns the expected endpoint', () => {
            const uri = new Uri({ serverUrl: 'http://spp.dev' });
            expect(uri.login('opt-email')).to.equal('http://spp.dev/bff-oauth/authorize?response_type=code&scope=openid&acr_values=opt-email');
        });

    });

    describe('sessionCluster', () => {

        it('returns the expected endpoint', () => {
            const uri = new Uri({ serverUrl: 'LOCAL' });
            expect(uri.sessionCluster(1)).to.equal('http://session.spp.dev/rpc/hasSession.js?autologin=1');
        });

    });

    describe('session', () => {

        it('returns the expected endpoint', () => {
            const uri = new Uri({ serverUrl: 'http://spp.dev' });
            expect(uri.session(1)).to.equal('http://spp.dev/ajax/hasSession.js?autologin=1');
        });

    });

    describe('payment', () => {

        it('returns the expected endpoint to purchase flow with default redirect uri', () => {
            const uri = new Uri({
                serverUrl: 'LOCAL',
                redirect_uri: 'http://localhost:4000',
                client_id: 'AAAxxEEE'
            });
            const result = uri.purchasePaylink(532);
            const parseResult = new URL(result);
            expect(parseResult.protocol).to.equal('http:');
            expect(parseResult.host).to.equal('spp.dev:4100');
            expect(parseResult.pathname).to.equal('/api/payment/purchase');
            checkSearchParams(parseResult.searchParams, {
                redirect_uri: 'http://localhost:4000',
                client_id: 'AAAxxEEE',
                paylink: '532'
            })
            expect(parseResult.searchParams.get('redirect_uri')).to.equal('http://localhost:4000', 'redirect_uri param');
            expect(parseResult.searchParams.get('client_id')).to.equal('AAAxxEEE', 'client_id param');
            expect(parseResult.searchParams.get('paylink')).to.equal('532', 'paylink param');
        });

        it('returns the expected endpoint to purchase flow with redirect uri', () => {
            const uri = new Uri({
                serverUrl: 'LOCAL',
                redirect_uri: 'http://localhost:4000', // this will be overriden
                client_id: 'AAAxxEEE'
            });
            const result = uri.purchasePaylink(532, 'http://localhost:5000');
            const parseResult = new URL(result);
            expect(parseResult.protocol).to.equal('http:');
            expect(parseResult.host).to.equal('spp.dev:4100');
            expect(parseResult.pathname).to.equal('/api/payment/purchase');
            checkSearchParams(parseResult.searchParams, {
                redirect_uri: 'http://localhost:5000',
                client_id: 'AAAxxEEE',
                paylink: '532'
            })
            expect(parseResult.searchParams.get('redirect_uri')).to.equal('http://localhost:5000', 'redirect_uri param');
            expect(parseResult.searchParams.get('client_id')).to.equal('AAAxxEEE', 'client_id param');
            expect(parseResult.searchParams.get('paylink')).to.equal('532', 'paylink param');
        });
    });

});
