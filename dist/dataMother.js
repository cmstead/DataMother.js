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
    var isObjectInstace = signet.isTypeOf('composite<not<null>, object>');
    var isArray = signet.isTypeOf('array');
    var isFunction = signet.isTypeOf('function');
    var isNotFunction = signet.isTypeOf('not<function>');
    var isDefined = signet.isTypeOf('not<undefined>');

    var set = function set(data, key, value) {
        data[key] = value;return data;
    };

    function helpersFactory(motherFactories) {

        var throwError = function throwError(errorMessage) {
            throw new Error(errorMessage);
        };

        function getFactoryOrThrow(name) {
            var errorMessage = 'Unable to find mother factory, \'' + name + '\'';

            return match(motherFactories[name], function (matchCase, matchDefault) {
                matchCase(isNotFunction, function () {
                    return throwError(errorMessage);
                });
                matchDefault(function (motherFactory) {
                    return motherFactory;
                });
            });
        }

        function throwOnBadOptionsObject(options) {
            if (isDefined(options) && !isOptionsObject(options)) {
                var optionsDefinitionString = JSON.stringify(optionsDefinition, null, 4);
                var errorMessage = 'Invalid options object. Expected value like ' + optionsDefinitionString;

                throwError(errorMessage);
            }
        }

        return {
            getFactoryOrThrow: getFactoryOrThrow,
            throwOnBadOptionsObject: throwOnBadOptionsObject
        };
    }

    function dataBuilderApiFactory(name, options, buildData, helpers, match) {
        var getFactoryOrThrow = helpers.getFactoryOrThrow,
            throwOnBadOptionsObject = helpers.throwOnBadOptionsObject;


        throwOnBadOptionsObject(options);

        function getOptionsData() {
            return (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options.optionsData : undefined;
        }

        var constructAndAttachProperty = function constructAndAttachProperty(index) {
            return function (data, key) {
                var optionsData = getOptionsData();

                var property = match(data[key], function (matchCase, matchDefault) {
                    matchCase(isFunction, function (dataFactory) {
                        return dataFactory(index, optionsData);
                    });
                    matchDefault(function (value) {
                        return value;
                    });
                });

                return set(data, key, property);
            };
        };

        function constructFactoryProps(dataOutput, index) {
            return Object.keys(dataOutput).reduce(constructAndAttachProperty(index), dataOutput);
        }

        function constructProperties(dataOutput) {
            var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            return match(dataOutput, function (matchCase, matchDefault) {
                matchCase(isObjectInstace, function (dataOutput) {
                    return constructFactoryProps(dataOutput, index);
                });
                matchDefault(function (dataOutput) {
                    return dataOutput;
                });
            });
        }

        function buildDataObjectArray(length) {
            var dataArray = [buildDataObject()];

            return match(length, function (matchCase, matchDefault) {
                matchCase(1, function () {
                    return dataArray;
                });
                matchDefault(function () {
                    return dataArray.concat(buildDataObjectArray(length - 1));
                });
            });
        }

        function buildDataObject() {
            var motherFactory = getFactoryOrThrow(name);
            var dependencyData = motherFactory['@dependencies'].map(function (value) {
                return buildData(value, options);
            });

            return motherFactory.apply(null, dependencyData);
        }

        return {
            buildDataObject: buildDataObject,
            buildDataObjectArray: buildDataObjectArray,
            constructProperties: constructProperties
        };
    }

    return function dataMother() {

        var motherFactories = {};
        var helpers = helpersFactory(motherFactories, buildData);

        function buildDataBuilderApi(name, options) {
            return dataBuilderApiFactory(name, options, buildData, helpers, match);
        }

        function buildDataArray(name) {
            var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var options = arguments[2];

            var dataBuilderApi = buildDataBuilderApi(name, options);
            var constructProperties = dataBuilderApi.constructProperties,
                buildDataObjectArray = dataBuilderApi.buildDataObjectArray;


            return buildDataObjectArray(length).map(constructProperties);
        }

        function buildData(name, options) {
            var dataBuilderApi = buildDataBuilderApi(name, options);
            var constructProperties = dataBuilderApi.constructProperties,
                buildDataObject = dataBuilderApi.buildDataObject;


            return constructProperties(buildDataObject(), 0);
        }

        function register(name, factory) {
            var dependencies = match(factory['@dependencies'], function (matchCase, matchDefault) {
                matchCase(isArray, function (dependencies) {
                    return dependencies;
                });
                matchDefault(function () {
                    return [];
                });
            });

            motherFactories[name] = set(factory, '@dependencies', dependencies);
        }

        return {
            buildData: signet.enforce('name:string, options:[object] => *', buildData),
            buildDataArray: signet.enforce('name:string, length:variant<undefined, leftBoundedInt<1>>, options:[object] => array<*>', buildDataArray),
            register: signet.enforce('name:string, factory:function => undefined', register)
        };
    };
});