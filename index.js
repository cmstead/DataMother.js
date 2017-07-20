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

    const optionsDefinition = {
        dataOptions: '?composite<^null, ^array, object>'
    };
    const isOptionsObject = signet.duckTypeFactory(optionsDefinition);

    function throwOnBadOptionsObject(options) {
        if (typeof options !== 'undefined' && !isOptionsObject(options)) {
            const optionsDefinitionString = JSON.stringify(optionsDefinition, null, 4);
            const errorMessage = `Invalid options object. Expected value like ${optionsDefinitionString}`;
            throw new Error(errorMessage);
        }
    }

    return function dataMother() {

        let motherFactories = {};

        const buildRest = (name, length) => buildDataObjectArray(name, length - 1);

        function buildDataObjectArray(name, length, options) {
            const dataArray = [buildDataObject(name, options)];

            return match(length, (matchCase, matchDefault) => {
                matchCase(1, () => dataArray);
                matchDefault(() => dataArray.concat(buildRest(name, length)));
            });
        }

        function buildDataArray(name, length = 1, options) {
            throwOnBadOptionsObject(options);
            return buildDataObjectArray(name, length, options)
                .map((value, index) => constructProperties(value, index, options));
        }

        function getFactoryOrThrow(name) {
            const errorMessage = `Unable to find mother factory, '${name}'`;
            const throwError = () => { throw new Error(errorMessage); };

            return match(motherFactories[name], (matchCase, matchDefault, byType) => {
                matchCase(byType('not<function>'), throwError);
                matchDefault((motherFactory) => motherFactory);
            });
        }

        function constructProperty(value, index, options) {
            return match(
                value,
                (matchCase, matchDefault, byType) => {
                    matchCase(byType('function'), (dataFactory) => dataFactory(index, options));
                    matchDefault((value) => value);
                });
        }

        const set = (data, key, value) => { data[key] = value; return data; };
        const get = (data, key) => typeof data === 'object' ? data[key] : (undefined);

        function constructFactoryProps(dataOutput, index, options) {
            const optionsData = get(options, 'optionsData');
            return Object
                .keys(dataOutput)
                .reduce((data, key) => {
                    const constructedProperty = constructProperty(data[key], index, optionsData);
                    return set(data, key, constructedProperty);
                }, dataOutput);
        }

        function constructProperties(dataOutput, index = 0, options) {
            return match(
                dataOutput,
                (matchCase, matchDefault, byType) => {
                    matchCase(byType('composite<not<null>, object>'),
                        (dataOutput) => constructFactoryProps(dataOutput, index, options));
                    matchDefault((dataOutput) => dataOutput);
                }
            );
        }

        function getDependencies(motherFactory, options) {
            return motherFactory['@dependencies'].map((value) => buildData(value, options));
        }

        function constructData(motherFactory, options) {
            const dependencyData = getDependencies(motherFactory, options);
            return motherFactory.apply(null, dependencyData);
        }

        function buildDataObject(name, options) {
            const motherFactory = getFactoryOrThrow(name);

            return match(options, (matchCase, matchDefault) => {
                matchDefault(() => constructData(motherFactory, options));
            });
        }

        function buildData(name, options) {
            throwOnBadOptionsObject(options);

            let dataOutput = buildDataObject(name, options);
            return constructProperties(dataOutput, 0, options);
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
                'name:string, options:[object] => *',
                buildData),
            buildDataArray: signet.enforce(
                'name:string, length:variant<undefined, leftBoundedInt<1>>, options:[object] => array<*>',
                buildDataArray),
            register: signet.enforce(
                'name:string, factory:function => undefined',
                register)
        };

    }

});
