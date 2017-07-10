/* eslint-disable no-unused-expressions */

'use strict';

const { expect } = require('chai');
const SDKError = require('./SDKError');
const { toBase64, cloneDefined, basicAuthHeader, bearerAuthHeader, urlNormalizer, server } = require('./util');

describe('util', () => {

    describe('toBase64()', () => {

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

    describe('cloneDefined()', () => {

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

    describe('urlNormalizer', () => {

        it('can handle hostname shorthands', () => {
            expect(urlNormalizer('SHORTHAND1', {
                'SHORTHAND1': 'http://shorthand1.local'
            })).to.equal('http://shorthand1.local');
        });

        it('returns the hostname parameter if the shorthand does not exist', () => {
            expect(urlNormalizer('SHORTHAND2', {
                'SHORTHAND1': 'http://shorthand1.local'
            })).to.equal('SHORTHAND2');
        });

    });

    describe('server', () => {

        it('can build uris with no default params', () => {
            const endpoint = new server('http://example.com');
            expect(endpoint('/server')).to.equal('http://example.com/server');
        });

        it('can build uris with params', () => {
            const endpoint = new server('http://example.com');
            expect(endpoint('/server', { a: 1, foo: 'bar' })).to.equal('http://example.com/server?a=1&foo=bar');
        });

        it('can build uris with default params', () => {
            const endpoint = new server('http://example.com', { a: 1, foo: 'bar' });
            expect(endpoint('/server')).to.equal('http://example.com/server?a=1&foo=bar');
        });

    });

});
