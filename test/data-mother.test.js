'use strict';
var dataMother = require('../index');
var assert = require('chai').assert;

// Sample motherfiles
var simpleTestData = require('./motherfiles/simpleTestData.mother');
var simpleNestedTestData = require('./motherfiles/simpleNestedTestData.mother');
var testDataWithPropertyFactory = require('./motherfiles/testDataWithPropertyFactory.mother');
var singleValueData = require('./motherfiles/singleValueData.mother');

function prettyJson (value) {
    return JSON.stringify(value, null, 4);
}

describe('dataMother', function () {

    require('./testUtils/approvalsConfig');
    var motherContainer;

    beforeEach(function () {
        motherContainer = dataMother();
        motherContainer.register('simpleTestData', simpleTestData);
        motherContainer.register('simpleNestedTestData', simpleNestedTestData);
        motherContainer.register('testDataWithPropertyFactory', testDataWithPropertyFactory);
        motherContainer.register('singleValueData', singleValueData);
    });

    it('should allow registration and building of a data factory', function () {
        let result = motherContainer.buildData('simpleTestData');
        this.verify(prettyJson(result));
    });

    it('should build data with dependencies', function () {
        let result = motherContainer.buildData('simpleNestedTestData');
        this.verify(prettyJson(result));
    });

    it('should build an array of data', function () {
        let length = 5;
        let result = motherContainer.buildDataArray('simpleNestedTestData', length);
        this.verify(prettyJson(result));
    });

    it('should build an array of data without passing a length', function () {
        let result = motherContainer.buildDataArray('simpleNestedTestData');
        this.verify(prettyJson(result));
    });

    it('should call a function on a build command', function () {
        let result = motherContainer.buildData('testDataWithPropertyFactory');
        this.verify(prettyJson(result));
    });

    it('should not barf on a single non-object value', function () {
        let testCall = motherContainer.buildData.bind(null, 'singleValueData');
        assert.doesNotThrow(testCall);
    });

    it('should call a function on a build array command', function () {
        let result = motherContainer.buildDataArray('testDataWithPropertyFactory', 3);
        this.verify(prettyJson(result));
    });

});
