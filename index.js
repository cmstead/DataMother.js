(function (dataMotherBuilder) {
    const isDefined = (value) => typeof value !== 'undefined';
    const isNode = isDefined(module) && isDefined(module.exports);

    if (isNode) {
        const signet = require('signet')();
        const matchlight = require('matchlight')(signet);

        module.exports = dataMotherBuilder(signet, matchlight);
    } else {
        if (!isDefined(matchlight) || !isDefined(signet)) {
            throw new Error('DataMother requires signet and Matchlight to work properly.');
        }

        const matchlight = matchlightFactory(signet);
        window.datMother = dataMotherBuilder(signet, matchlight);
    }

})(function dataMotherBuilder(signet, matchlight) {
    'use strict';

    const match = matchlight.match;

    return function dataMother() {

        let motherFactories = {};

        function buildDataArray(name, length = 1) {
            const dataArray = [buildData(name)];
            const buildRest = () => buildDataArray(name, length - 1);

            return match(length, (matchCase, matchDefault) => {
                matchCase(1, () => dataArray);
                matchDefault(() => dataArray.concat(buildRest()));
            });
        }

        function buildData(name) {
            const motherFactory = motherFactories[name];
            const dependencies = motherFactory['@dependencies'].map(buildData);

            return motherFactory.apply(null, dependencies);
        }

        function register(name, factory) {
            const depsArray = match(
                factory['@dependencies'],
                (matchCase, matchDefault, byType) => {
                    matchCase(byType('array'), (depsArray) => depsArray);
                    matchDefault(() => []);
                }
            );

            factory['@dependencies'] = depsArray;
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
