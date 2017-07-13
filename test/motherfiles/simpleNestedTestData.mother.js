'use strict';

function simpleNestedTestData(simpleTestData) {
    return {
        ownProperty: ['foo', 'bar', 'baz'],
        nestedDependency: simpleTestData
    };
}

simpleNestedTestData['@dependencies'] = ['simpleTestData'];

module.exports = simpleNestedTestData;
