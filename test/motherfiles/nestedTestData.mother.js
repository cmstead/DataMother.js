'use strict';

function nestedTestData (simpleNestedTestDataArray, simpleTestData) {
    return {
        ownProperty: 'something',
        dependencyData: simpleNestedTestDataArray,
        simpleTestData: simpleTestData
    };
}

nestedTestData['@dependencies'] = ['simpleNestedTestData', 'simpleTestData'];

module.exports = nestedTestData;
