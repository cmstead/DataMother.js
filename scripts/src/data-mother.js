var dataMother = (function () {
    'use strict';

    var data = {};

    function isTypeOf(typeStr) {
        return function (value) {
            return typeof value === typeStr;
        };
    }

    function getTypeCheck(check) {
        return isTypeOf('function')(check) ? check : isTypeOf(check);
    }

    function isSafeObject(value) {
        return isTypeOf('object')(value) && value !== null;
    }

    function isInt (value){
        return isTypeOf('number')(value) && Math.floor(value) === value;
    }

    function either(type) {
        var typeCheck = getTypeCheck(type);

        return function (fallback) {
            return function (value) {
                return typeCheck(value) ? value : fallback;
            };
        };
    }

    function repeat (operation){
        return function (count) {
            for(var i = 0; i < count; i++){
                operation(i);
            }
        };
    }

    function create(value) {
        return isTypeOf('object')(value) ? Object.create(value) : value;
    }

    function set(obj) {
        return function (key, value) {
            obj[key] = value;
            return obj;
        };
    }

    function buildProperty(dataObj, key, options, index) {
        var tempValue = dataObj[key];

        return isTypeOf('function')(tempValue) ?
            tempValue(options[key], index) :
            create(tempValue);
    }

    function buildAddProperty(dataObj, options, index) {
        return function (finalObject, key) {
            var newObj = buildProperty(dataObj, key, options, index);
            return set(finalObject)(key, newObj);
        };
    }

    function build(key, options, index) {
        var cleanOptions = either(isSafeObject)({})(options);
        var cleanIndex = isTypeOf('number')(index) ? index : 0;

        return Object.keys(data[key])
            .reduce(buildAddProperty(data[key], cleanOptions, cleanIndex), {});
    }

    function buildArrayOf(key, count, options) {
        var result = [];

        repeat(function (index) {
            result.push(build(key, options, index));
        })(either('number')(1)(count));

        return result;
    }

    function register(key, value) {
        data[key] = value;
    }

    function require (key){
        return function (options) {
            return build(key, options);
        };
    }

    function getCount (key, options){
        var cleanOptions = either(isSafeObject)({})(options);

        return either(isInt)(1)(cleanOptions._count);
    }

    function requireArrayOf (key){
        return function (options) {
            var count = getCount(key, options);

            return buildArrayOf(key, count, options);
        };
    }

    return {
        build: build,
        buildArrayOf: buildArrayOf,
        register: register,
        require: require,
        requireArrayOf: requireArrayOf
    };

})();

// This will prevent dataMother from throwing a fit
// if it is being run in a browser environment.
// If it is not in a browser, we'll export this
// for use in node.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dataMother;
}