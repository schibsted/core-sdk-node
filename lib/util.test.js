/* eslint-disable no-unused-expressions */

'use strict';

const { expect } = require('chai');
const util = require('./../lib/util');

describe('util', () => {

    describe('toBase64()', () => {

        const { toBase64 } = util;

        it('is a function', () => {
            expect(toBase64).to.be.a('function');
        });

        it('throws for non string values', () => {
            expect(() => toBase64()).to.throw();
            expect(() => toBase64(null)).to.throw();
            expect(() => toBase64(1)).to.throw();
            expect(() => toBase64(false)).to.throw();
            expect(() => toBase64({})).to.throw();
            expect(() => toBase64([])).to.throw();
            expect(() => toBase64(() => 0)).to.throw();
            expect(() => toBase64(true)).to.throw();
        });

        it('encodes empty string', () => {
            expect(toBase64('')).to.equal('');
        });

        it('encodes user:pass correctly', () => {
            // Example from https://en.wikipedia.org/wiki/Basic_access_authentication
            expect(toBase64('Aladdin:OpenSesame')).to.equal('QWxhZGRpbjpPcGVuU2VzYW1l');
        });

    });

    describe('isNonEmptyStr()', () => {

        const { isNonEmptyStr } = util;

        it('returns false for non strings', () => {
            expect(isNonEmptyStr()).to.be.false;
            expect(isNonEmptyStr(0)).to.be.false;
            expect(isNonEmptyStr(1)).to.be.false;
            expect(isNonEmptyStr(null)).to.be.false;
            expect(isNonEmptyStr({})).to.be.false;
            expect(isNonEmptyStr([])).to.be.false;
            expect(isNonEmptyStr(true)).to.be.false;
        });

        it('returns false for empty string', () => {
            expect(isNonEmptyStr('')).to.be.false;
        });

        it('returns true for non-empty strings', () => {
            expect(isNonEmptyStr('hi')).to.be.true;
        });

    });

    describe('isObject()', () => {

        const { isObject } = util;

        it('returns false for non-object values', () => {
            expect(isObject()).to.be.false;
            expect(isObject(1)).to.be.false;
            expect(isObject(false)).to.be.false;
            expect(isObject(0)).to.be.false;
            expect(isObject('hi')).to.be.false;
            expect(isObject(() => 0)).to.be.false;
        });

        it('returns false for null', () => {
            expect(isObject(null)).to.be.false;
        });

        it('returns true for objects and arrays', () => {
            expect(isObject({})).to.be.true;
            expect(isObject([])).to.be.true;
            expect(isObject({ a: 0 })).to.be.true;
        });

    });

    describe('isNonEmptyObj()', () => {

        const { isNonEmptyObj } = util;

        it('returns false for non-object values', () => {
            expect(isNonEmptyObj()).to.be.false;
            expect(isNonEmptyObj(1)).to.be.false;
            expect(isNonEmptyObj(false)).to.be.false;
            expect(isNonEmptyObj(0)).to.be.false;
            expect(isNonEmptyObj('hi')).to.be.false;
            expect(isNonEmptyObj(() => 0)).to.be.false;
        });

        it('returns false for null', () => {
            expect(isNonEmptyObj(null)).to.be.false;
        });

        it('returns false if the object has no keys', () => {
            expect(isNonEmptyObj({})).to.be.false;
        });

        it('returns false for an empty array', () => {
            expect(isNonEmptyObj([])).to.be.false;
        });

        it('returns false if the object has no own keys (but inherits some)', () => {
            const proto = { aaa: 13 };
            const obj = Object.create(proto);
            expect(isNonEmptyObj(obj)).to.be.false;
        });

        it('returns true if the object has own keys', () => {
            expect(isNonEmptyObj({ x: 234 })).to.be.true;
        });

        it('returns true for an array with elements', () => {
            expect(isNonEmptyObj(['a', 'b', 'c'])).to.be.true;
        });

    });

    describe('cloneDefined()', () => {

        const { cloneDefined } = util;

        it('throws for non objects', () => {
            expect(() => cloneDefined()).to.throw;
            expect(() => cloneDefined(1)).to.throw;
            expect(() => cloneDefined(null)).to.throw;
            expect(() => cloneDefined('str')).to.throw;
            expect(() => cloneDefined(true)).to.throw;
        });

        it('clones an empty object', () => {
            const emptyObj = {};
            const clonedObj = cloneDefined(emptyObj);
            expect(clonedObj).to.be.an('object').and.empty;
            expect(emptyObj).not.to.equal(clonedObj);
        });

        it('creates a new object', () => {
            const empty = {};
            const nonEmpty = { a: 2 };
            const array = [ 1, 2, 3, 4, 5, 6 ];
            expect(cloneDefined(empty) === empty).to.be.false;
            expect(cloneDefined(empty)).not.to.equal(empty, 'empty object');
            expect(cloneDefined(nonEmpty)).not.to.equal(nonEmpty, 'non empty object');
            expect(cloneDefined(array)).not.to.equal(array, 'array');
        });

        it('ignores the prototypically inherited members', () => {
            const proto = { a: 19834 };
            const obj = Object.create(proto);
            let clonedObj = cloneDefined(obj);
            expect(clonedObj).to.deep.equal({});
            expect(clonedObj).not.to.equal(proto);

            obj.foo = 'bar';
            clonedObj = cloneDefined(obj);
            expect(clonedObj).to.deep.equal({ foo: 'bar' });
            expect(clonedObj).not.to.equal(proto);
        });

        it('ignores the values that are undefined', () => {
            const obj = { a: 19834, b: undefined, c: 'to be deleted' };
            delete obj.c;
            const clonedObj = cloneDefined(obj);
            expect(clonedObj).to.deep.equal({ a: 19834 });
        });

        it('does not ignore any non-undefined values', () => {
            const clonedObj = cloneDefined({
                b: true,
                s: 'a string',
                n: 1300
            });
            expect(clonedObj.b).to.equal(true);
            expect(clonedObj.s).to.equal('a string');
            expect(clonedObj.n).to.equal(1300);
        });

    });

    describe('basicAuthHeader()', () => {

        const { basicAuthHeader } = util;

        it('throws if the user is not a string or is an empty string', () => {
            expect(() => basicAuthHeader(undefined, 'pa$$word')).to.throw();
            expect(() => basicAuthHeader('', 'pa$$word')).to.throw();
        });

        it('throws if the password is not a string', () => {
            expect(() => basicAuthHeader('u$sern@ame')).to.throw();
        });

        it('return the correct header', () => {
            // Example from https://en.wikipedia.org/wiki/Basic_access_authentication
            expect(basicAuthHeader('Aladdin', 'OpenSesame')).to.equal('Basic QWxhZGRpbjpPcGVuU2VzYW1l');
        });

    });

    describe('bearerAuthHeader()', () => {

        const { bearerAuthHeader } = util;

        it('throws if the token is missing', () => {
            expect(() => bearerAuthHeader()).to.throw();
        });

        it('throws if the token is not a string', () => {
            expect(() => bearerAuthHeader(0)).to.throw();
            expect(() => bearerAuthHeader(true)).to.throw();
            expect(() => bearerAuthHeader(null)).to.throw();
            expect(() => bearerAuthHeader({})).to.throw();
        });

        it('throws if the token is an empty string', () => {
            expect(() => bearerAuthHeader('')).to.throw();
        });

        it('returns the correct header', () => {
            expect(bearerAuthHeader('some_token')).to.equal('Bearer some_token');
        });

    });

    describe('newRejectedSDKError()', () => {

        const { newRejectedSDKError } = util;

        it('returns a rejected promise', (done) => {
            const ret = newRejectedSDKError('a message', 2934);
            ret.catch(() => done());
        });

        it('returns a promise that has passed all the fields correctly to the underlying SDKError', (done) => {
            const ret = newRejectedSDKError('a message', 2934);
            expect(ret).has.property('then');
            ret.catch(err => {
                expect(err.code).to.equal(2934);
                done();
            });
        });

    });


});
