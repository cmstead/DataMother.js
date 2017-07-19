(function (dataMotherBuilder) {
    if (typeof require === 'function') {
        const signet = require('signet')();
        const matchlight = require('matchlight')(signet);

        module.exports = dataMotherBuilder(signet, matchlight);
    } else {
        if (typeof matchlightFactory === 'undefined' || typeof signet === 'undefined') {
            throw new Error('DataMother requires signet and Matchlight to work properly.');
        }

        const matchlight = matchlightFactory(signet);

        window.dataMother = dataMotherBuilder(signet, matchlight)();
    }

})(function dataMotherBuilder(signet, matchlight) {
    'use strict';

    const match = matchlight.match;

    return function dataMother() {

        let motherFactories = {};

        const buildRest = (name, length) => buildDataArray(name, length - 1);

        function buildDataArray(name, length = 1) {
            const dataArray = [buildData(name)];

            return match(length, (matchCase, matchDefault) => {
                matchCase(1, () => dataArray);
                matchDefault(() => dataArray.concat(buildRest(name, length)));
            });
        }

        function getDependencies(motherFactory) {
            return motherFactory['@dependencies'].map(buildData);
        }

        function getFactoryOrThrow(name) {
            const errorMessage = `Unable to find mother factory, '${name}'`;
            const throwError = () => { throw new Error(errorMessage); };

            return match(motherFactories[name], (matchCase, matchDefault, byType) => {
                matchCase(byType('not<function>'), throwError);
                matchDefault((motherFactory) => motherFactory);
            });
        }

        function constructData(motherFactory) {
            const dependencyData = getDependencies(motherFactory);
            return motherFactory.apply(null, dependencyData);
        }

        function buildData(name, options) {
            const motherFactory = getFactoryOrThrow(name);

            return match(options, (matchCase, matchDefault) => {
                matchDefault(() => constructData(motherFactory));
            });
        }

        function register(name, factory) {
            const dependencies = match(
                factory['@dependencies'],
                (matchCase, matchDefault, byType) => {
                    matchCase(byType('array'), (dependencies) => dependencies);
                    matchDefault(() => []);
                });

            factory['@dependencies'] = dependencies;
            motherFactories[name] = factory;
        }


        return {
            buildData: signet.enforce(
                'name:string => *',
                buildData),
            buildDataArray: signet.enforce(
                'name:string, length:[leftBoundedInt<1>] => array<*>',
                buildDataArray),
            register: signet.enforce(
                'name:string, factory:function => undefined',
                register)
        };

    }

});
