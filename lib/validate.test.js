'use strict';

const { expect } = require('chai');
const validate = require('./validate');

describe('validate', () => {

    describe('isNonEmptyStr()', () => {

        const { isNonEmptyStr } = validate;

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

        const { isObject } = validate;

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

        const { isNonEmptyObj } = validate;

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

});
