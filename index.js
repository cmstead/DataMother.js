(function (dataMotherBuilder) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    if (isNode) {
        const signet = require('signet')();
        const matchlight = require('matchlight')(signet);

        module.exports = dataMotherBuilder(signet, matchlight);
    } else {
        if (typeof matchlightFactory === 'undefined' || typeof signet === 'undefined') {
            throw new Error('DataMother requires signet and Matchlight to work properly.');
        }

        const matchlight = matchlightFactory(signet);

        window.dataMother = dataMotherBuilder(signet, matchlight);
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

        function buildData(name) {
            return match(
                motherFactories[name],
                function (matchCase, matchDefault, byType) {
                    matchCase(byType('not<function>'), () => {
                        throw new Error('Unable to find mother factory, ' + name);
                    });
                    matchDefault((motherFactory) =>
                        motherFactory.apply(null, getDependencies(motherFactory)));
                }
            );
        }

        function register(name, factory) {
            factory['@dependencies'] = match(
                factory['@dependencies'],
                (matchCase, matchDefault, byType) => {
                    matchCase(byType('array'), (depsArray) => depsArray);
                    matchDefault(() => []);
                }
            );

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
