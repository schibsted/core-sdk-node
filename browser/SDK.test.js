'use strict';

const { expect } = require('chai');
const identityWebSdkBrowser = require('./SDK');

describe('SDK', () => {
    const SDK = identityWebSdkBrowser.default;

    describe('Constructor', () => {
        it('throws if the options object is not passed to the constructor', () => {
            expect(() => new SDK()).to.throw();
        });

        it('throws if the server setting is missing or has wrong type', () => {
            expect(() => new SDK({ client_id: 'xxxx' })).to.throw();
            expect(() => new SDK({ client_id: 'xxxx', server: true })).to.throw();
        });

        it('throws if the client_id setting is missing or has wrong type', () => {
            expect(() => new SDK({ server: 'spp.dev' })).to.throw();
            expect(() => new SDK({ server: 'spp.dev', client_id: true })).to.throw();
        });
    });
});
