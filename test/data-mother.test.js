'use strict';
var dataMother = require('../index');

// Sample motherfiles
var simpleTestData = require('./motherfiles/simpleTestData.mother');
var simpleNestedTestData = require('./motherfiles/simpleNestedTestData.mother');

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

});
