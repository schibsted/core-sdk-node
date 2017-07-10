'use strict';

const SDKError = require('./SDKError');
const { expect } = require('chai');

describe('SDKError', () => {

    describe('reject()', () => {

        it('returns a rejected promise', (done) => {
            const ret = SDKError.reject('a message', 2934);
            ret.catch(() => done());
        });

        it('returns a promise that has passed all the fields correctly to the underlying SDKError', (done) => {
            const errorObj = { foo: 'bar' };
            const ret = SDKError.reject('another message', 3934, { foo: 'bar' });
            expect(ret).has.property('then');
            ret.catch(err => {
                expect(err.code).to.equal(3934);
                expect(err.foo).to.equal('bar');
                done();
            });
        });

    });

});
