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
            return buildDataArray(name, length - 1);
        };

        function buildDataArray(name) {
            var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var dataArray = [buildData(name)];

            return match(length, function (matchCase, matchDefault) {
                matchCase(1, function () {
                    return dataArray;
                });
                matchDefault(function () {
                    return dataArray.concat(buildRest(name, length));
                });
            });
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

        function buildData(name, options) {
            var motherFactory = getFactoryOrThrow(name);

            return match(options, function (matchCase, matchDefault) {
                matchDefault(function () {
                    return constructData(motherFactory);
                });
            });
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