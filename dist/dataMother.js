'use strict';

(function (dataMotherBuilder) {
    if (typeof require === 'function') {
        var _signet = require('signet')();
        var matchlight = require('matchlight')(_signet);

        module.exports = dataMotherBuilder(_signet, matchlight);
    } else {
        if (typeof matchlightFactory === 'undefined' || typeof signet === 'undefined') {
            throw new Error('DataMother requires signet and Matchlight to work properly.');
        }

        var _matchlight = matchlightFactory(signet);

        window.dataMother = dataMotherBuilder(signet, _matchlight)();
    }
})(function dataMotherBuilder(signet, matchlight) {
    'use strict';

    var match = matchlight.match;

    return function dataMother() {

        var motherFactories = {};

        var buildRest = function buildRest(name, length) {
            return buildDataObjectArray(name, length - 1);
        };

        function buildDataObjectArray(name, length) {
            var dataArray = [buildDataObject(name)];

            return match(length, function (matchCase, matchDefault) {
                matchCase(1, function () {
                    return dataArray;
                });
                matchDefault(function () {
                    return dataArray.concat(buildRest(name, length));
                });
            });
        }

        function buildDataArray(name) {
            var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return buildDataObjectArray(name, length).map(constructProperties);
        }

        function getDependencies(motherFactory) {
            return motherFactory['@dependencies'].map(buildData);
        }

        function getFactoryOrThrow(name) {
            var errorMessage = 'Unable to find mother factory, \'' + name + '\'';
            var throwError = function throwError() {
                throw new Error(errorMessage);
            };

            return match(motherFactories[name], function (matchCase, matchDefault, byType) {
                matchCase(byType('not<function>'), throwError);
                matchDefault(function (motherFactory) {
                    return motherFactory;
                });
            });
        }

        function constructData(motherFactory) {
            var dependencyData = getDependencies(motherFactory);
            return motherFactory.apply(null, dependencyData);
        }

        function constructProperty(value, index) {
            return match(value, function (matchCase, matchDefault, byType) {
                matchCase(byType('function'), function (dataFactory) {
                    return dataFactory(index);
                });
                matchDefault(function (value) {
                    return value;
                });
            });
        }

        var buildConstructAction = function buildConstructAction(data, index) {
            return function (key) {
                return data[key] = constructProperty(data[key], index);
            };
        };

        function constructProperties(dataOutput) {
            var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            return match(dataOutput, function (matchCase, matchDefault, byType) {
                matchCase(byType('composite<not<null>, object>'), function (dataOutput) {
                    var keys = Object.keys(dataOutput);
                    keys.forEach(buildConstructAction(dataOutput, index));
                    return dataOutput;
                });
                matchDefault(function (dataOutput) {
                    return dataOutput;
                });
            });
        }

        function buildDataObject(name, options) {
            var motherFactory = getFactoryOrThrow(name);

            return match(options, function (matchCase, matchDefault) {
                matchDefault(function () {
                    return constructData(motherFactory);
                });
            });
        }

        function buildData(name, options) {
            var dataOutput = buildDataObject(name, options);
            return constructProperties(dataOutput);
        }

        function register(name, factory) {
            var dependencies = match(factory['@dependencies'], function (matchCase, matchDefault, byType) {
                matchCase(byType('array'), function (dependencies) {
                    return dependencies;
                });
                matchDefault(function () {
                    return [];
                });
            });

            factory['@dependencies'] = dependencies;
            motherFactories[name] = factory;
        }

        return {
            buildData: signet.enforce('name:string => *', buildData),
            buildDataArray: signet.enforce('name:string, length:[leftBoundedInt<1>] => array<*>', buildDataArray),
            register: signet.enforce('name:string, factory:function => undefined', register)
        };
    };
});