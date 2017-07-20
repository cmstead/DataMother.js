# DataMother #

DataMother is a test data construction library to make creating and using test data fast, easy and predictable. By centralizing data in factories with declared dependencies, your tests will always use the correct data format which will make tests more reliable.  When real-world data contracts change, simply change your data files and then use your tests to identify where things went wrong!

DataMother makes writing tests fast and making correct tests easier.

## API ##

This is the basic API, examples are listed below.

- dataMother.register -- `name:string, factory:function => undefined`
    - Register registers a mother object with DataMother for data creation later. Register requires a key and an object and returns undefined.

- dataMother.buildData -- `name:string, options:[object] => *`
    - Build returns a new instance of test data as well as nested instances of depency objects.

- dataMother.buildDataArray -- `name:string, length:variant<undefined, leftBoundedInt<1>>, options:[object] => array<*>`
    - BuildDataArray returns a new array of data containing a number of data elements equal to the length passed in.  When no length is provided, the length will be 1.

## Examples ##

- **A sample motherfile in Node might look like the following:**

```
'use strict';

function nestedTestData (simpleNestedTestDataArray, simpleTestData) {
    return {
        ownProperty: 'something',
        dependencyData: simpleNestedTestDataArray,
        simpleTestData: simpleTestData
    };
}

nestedTestData['@dependencies'] = ['simpleNestedTestData', 'simpleTestData'];

module.exports = nestedTestData;
```


- **Likewise, in the client a motherfile might look like this:**

```
(function () {
    'use strict';

    function nestedTestData (simpleNestedTestDataArray, simpleTestData) {
        return {
            ownProperty: 'something',
            dependencyData: simpleNestedTestDataArray,
            simpleTestData: simpleTestData
        };
    }

    nestedTestData['@dependencies'] = ['simpleNestedTestData', 'simpleTestData'];

    dataMother.register('nestedTestData', nestedTestData);
})()
```

- **Capturing data from DataMother is as easy as the following:**

```
const simpleData = dataMother.buildData('simpleTestData');
const simpleData = dataMother.buildDataArray('simpleTestData', 5);
```


- **Properties can be data factories so data can be dynamically generated per test**

```
'use strict';

function testDataWithPropertyFactory () {
    return {
        property1: 'foo',
        property2: function (index) {
            // index always starts at 0
            return 'bar' + index;
        }
    };
}

module.exports = testDataWithPropertyFactory;
```
- **Data can be constructed with data properties via the options object**

```
const options = {
    optionsData: {
        testDataWithPropertyFactory: {
            value: 'testValue'
        }
    }
}

// Constructing a single data value
motherContainer.buildData('testDataWithPropertyFactory', options);

// Constructing an array of data
motherContainer.buildDataArray('testDataWithPropertyFactory', 3, options);
```
