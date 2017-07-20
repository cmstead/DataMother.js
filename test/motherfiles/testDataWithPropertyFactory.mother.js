'use strict';

const propertyOptions = [
    'bar',
    'baz',
    'quux'
]

function testDataWithPropertyFactory () {
    return {
        property1: 'foo',
        property2: function (index, optionsData) {
            return typeof optionsData === 'undefined'
                ? propertyOptions[index % 3]
                : optionsData.testDataWithPropertyFactory.value + index;
        }
    };
}

module.exports = testDataWithPropertyFactory;
