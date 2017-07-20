'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

    var optionsDefinition = {
        dataOptions: '?composite<^null, ^array, object>'
    };
    var isOptionsObject = signet.duckTypeFactory(optionsDefinition);

    function throwOnBadOptionsObject(options) {
        if (typeof options !== 'undefined' && !isOptionsObject(options)) {
            var optionsDefinitionString = JSON.stringify(optionsDefinition, null, 4);
            var errorMessage = 'Invalid options object. Expected value like ' + optionsDefinitionString;
            throw new Error(errorMessage);
        }
    }

    return function dataMother() {

        var motherFactories = {};

        var buildRest = function buildRest(name, length) {
            return buildDataObjectArray(name, length - 1);
        };

        function buildDataObjectArray(name, length, options) {
            var dataArray = [buildDataObject(name, options)];

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
            var options = arguments[2];

            throwOnBadOptionsObject(options);
            return buildDataObjectArray(name, length, options).map(function (value, index) {
                return constructProperties(value, index, options);
            });
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

        function constructProperty(value, index, options) {
            return match(value, function (matchCase, matchDefault, byType) {
                matchCase(byType('function'), function (dataFactory) {
                    return dataFactory(index, options);
                });
                matchDefault(function (value) {
                    return value;
                });
            });
        }

        var set = function set(data, key, value) {
            data[key] = value;return data;
        };
        var get = function get(data, key) {
            return (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' ? data[key] : undefined;
        };

        function constructFactoryProps(dataOutput, index, options) {
            var optionsData = get(options, 'optionsData');
            return Object.keys(dataOutput).reduce(function (data, key) {
                var constructedProperty = constructProperty(data[key], index, optionsData);
                return set(data, key, constructedProperty);
            }, dataOutput);
        }

        function constructProperties(dataOutput) {
            var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var options = arguments[2];

            return match(dataOutput, function (matchCase, matchDefault, byType) {
                matchCase(byType('composite<not<null>, object>'), function (dataOutput) {
                    return constructFactoryProps(dataOutput, index, options);
                });
                matchDefault(function (dataOutput) {
                    return dataOutput;
                });
            });
        }

        function getDependencies(motherFactory, options) {
            return motherFactory['@dependencies'].map(function (value) {
                return buildData(value, options);
            });
        }

        function constructData(motherFactory, options) {
            var dependencyData = getDependencies(motherFactory, options);
            return motherFactory.apply(null, dependencyData);
        }

        function buildDataObject(name, options) {
            var motherFactory = getFactoryOrThrow(name);

            return match(options, function (matchCase, matchDefault) {
                matchDefault(function () {
                    return constructData(motherFactory, options);
                });
            });
        }

        function buildData(name, options) {
            throwOnBadOptionsObject(options);

            var dataOutput = buildDataObject(name, options);
            return constructProperties(dataOutput, 0, options);
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
            buildData: signet.enforce('name:string, options:[object] => *', buildData),
            buildDataArray: signet.enforce('name:string, length:variant<undefined, leftBoundedInt<1>>, options:[object] => array<*>', buildDataArray),
            register: signet.enforce('name:string, factory:function => undefined', register)
        };
    };
});