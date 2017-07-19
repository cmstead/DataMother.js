'use strict';

function testDataWithPropertyFactory () {
    return {
        property1: 'foo',
        property2: function (index) {
            return 'bar' + index;
        }
    };
}

module.exports = testDataWithPropertyFactory;
