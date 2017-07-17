'use strict';

(function (dataMotherBuilder) {
    var isDefined = function isDefined(value) {
        return typeof value !== 'undefined';
    };
    var isNode = isDefined(module) && isDefined(module.exports);

    if (isNode) {
        var _signet = require('signet')();
        var matchlight = require('matchlight')(_signet);

        module.exports = dataMotherBuilder(_signet, matchlight);
    } else {
        if (!isDefined(_matchlight) || !isDefined(signet)) {
            throw new Error('DataMother requires signet and Matchlight to work properly.');
        }

        var _matchlight = matchlightFactory(signet);
        window.dataMother = dataMotherBuilder(signet, _matchlight);
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

        function buildData(name) {
            return match(motherFactories[name], function (matchCase, matchDefault, byType) {
                matchCase(byType('not<function>'), function () {
                    throw new Error('Unable to find mother factory, ' + name);
                });
                matchDefault(function (motherFactory) {
                    return motherFactory.apply(null, getDependencies(motherFactory));
                });
            });
        }

        function register(name, factory) {
            factory['@dependencies'] = match(factory['@dependencies'], function (matchCase, matchDefault, byType) {
                matchCase(byType('array'), function (depsArray) {
                    return depsArray;
                });
                matchDefault(function () {
                    return [];
                });
            });

            motherFactories[name] = factory;
        }

        return {
            buildData: signet.enforce('name:string => *', buildData),
            buildDataArray: signet.enforce('name:string, length:[leftBoundedInt<1>] => array<*>', buildDataArray),
            register: signet.enforce('name:string, factory:function => undefined', register)
        };
    };
});