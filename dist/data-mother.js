var dataMother;

(function(){
    'use strict';

    var data = {};

    function create(value){
        return typeof value === 'object' ? Object.create(value) : value;
    }

    function build(key, options){
        var finalObject = {},
            sanitizedOptions = (!!options) ? options : {},
            index,
            tempValue;

        for(index in data[key]){
            tempValue = data[key][index];

            finalObject[index] = typeof tempValue !== 'function' ?
                                    create(tempValue) : tempValue(sanitizedOptions[index]);
        }

        return finalObject;
    }

    function buildArrayOf(key, count, options){
        var arraySize = typeof count === 'number' ? count : 1,
            outputArray = [],
            index = 0;

        while(index < arraySize){
            outputArray.push(build(key, options));
            index++;
        }

        return outputArray;
    }

    function register(key, value){
        data[key] = value;
    }

    dataMother = {
        build: build,
        buildArrayOf: buildArrayOf,
        register: register
    };

})();

// This will prevent dataMother from throwing a fit
// if it is being run in a browser environment.
// If it is not in a browser, we'll export this
// for use in node.
if(typeof module !== 'undefined' && module.exports){
    module.exports = dataMother;
}