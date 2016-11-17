var assert = require('chai').assert;
var dataMother = require('../scripts/src/data-mother');

(function () {
    'use strict';

    describe('dataMother', function () {

        it('should be an object', function () {
            assert.equal(typeof dataMother, 'object');
        });

        describe('build', function () {

            beforeEach(function () {
                dataMother.register('testKey', {
                    id: function () { return Math.floor(Math.random() * 100); },
                    value: 'static value'
                });
            });

            it('should return an instance of the object stored at the key', function () {
                assert.equal(typeof dataMother.build('testKey'), 'object');
            });

            it('should execute initialization functions', function () {
                var testValue = dataMother.build('testKey');

                assert.equal(typeof testValue.id, 'number');
            });

            it('should execute initialization functions with option values', function () {
                var passedValue,
                    testPrototype = {
                        id: 1,
                        testValue: ''
                    };

                function init(options) {
                    passedValue = options;
                }

                testPrototype.testValue = init;

                dataMother.register('testObj', testPrototype);

                dataMother.build('testObj', {
                    testValue: 'foo'
                });

                assert.equal(passedValue, 'foo');
            });

        });

        describe('buildArrayOf', function () {

            beforeEach(function () {
                dataMother.register('testKey', {
                    id: function () { return Math.floor(Math.random() * 100); },
                    value: 'test value'
                });
            });

            it('should return an array containing a single object when no value is provided', function () {
                assert.equal(dataMother.buildArrayOf('testKey').length, 1);
            });

            it('should return an array of objects', function () {
                assert.equal(dataMother.buildArrayOf('testKey', 5).length, 5);
            });

            it('should call build with provided options', function () {
                var passedValue = [],
                    testPrototype = {
                        id: 1,
                        testValue: ''
                    };

                function init(options) {
                    passedValue.push(options);
                }

                testPrototype.testValue = init;

                dataMother.register('testObj', testPrototype);

                dataMother.buildArrayOf('testObj', 3, {
                    testValue: 'foo'
                });

                assert.equal(JSON.stringify(passedValue), '["foo","foo","foo"]');
            });

            it('should build an array of elements using the repeat index as a value option', function () {
                
                var testPrototype = {
                    index: function (_, index) {
                        return index;
                    }
                };

                dataMother.register('indexedVals', testPrototype);

                var result = JSON.stringify(dataMother.buildArrayOf('indexedVals', 3))
                var expected = JSON.stringify([
                    {index: 0},
                    {index: 1},
                    {index: 2},
                ]);

                assert.equal(result, expected);

            });

        });

        describe('register', function () {

            it('should register an object to the system', function () {
                dataMother.register('registrationTest', {});

                assert.equal(typeof dataMother.build('registrationTest'), 'object');
            });

        });

        describe('require', function () {

            it('should return a function which returns an object', function () {
                dataMother.register('requireTest', { foo: function (value) { return value } });
                var options = {
                    foo: 'bar'
                };

                var result = dataMother.require('requireTest')(options);

                assert.equal(JSON.stringify(result), '{"foo":"bar"}');
            });

        });

        describe('requireArrayOf', function () {

            it('should return a function returning an array of two elements', function () {
                dataMother.register('requireTest', { foo: function (value) { return value } });
                var options = {
                    _count: 2,
                    foo: 'bar'
                };

                var result = dataMother.requireArrayOf('requireTest')(options);

                assert.equal(JSON.stringify(result), '[{"foo":"bar"},{"foo":"bar"}]');
            });

        });

    });

})();
