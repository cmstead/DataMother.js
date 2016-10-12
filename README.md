# DataMother.js

DataMother.js will be a data management and injection tool to ease the burden of managing data in
unit test files and shorten the time to produce high quality unit tests through using familiar
programming patterns like registering objects and declaring dependent behaviors.

DataMother.js will tentatively be released under the MIT license and will always be free (as in speech and beer) software.

DataMother.js will follow the to-do list below.  This is the first round of to-dos and it may grow
or change over time.

- [x] Register data objects -- register(key, value);
- [x] Get a single instance of a data object -- get(key, options);
- [x] Get an array of instances of a single data object -- getArrayOf(key, options);
- [x] Handle initialization functions and static values as defined in data object mother files (Motherfiles)
- [x] Resolve options passed to build functions


##API

dataMother.register
`key, motherObject => undefined`

Register registers a mother object with DataMother for data creation later. Register requires a key and an object and returns undefined.

dataMother.build
`key, [options] => object`

Build requires a key and accepts options if they are used by a mother definition. Build returns a new instance of an object as well as nested instances of depency objects.

dataMother.buildArrayOf
`key, [count], [options] => array<object>`

BuildArrayOf requires a key and, by default, returns an array of object instances containing 1 object. Count is the number of instances you need in your array, all values 0 and greater are valid. Options are instance options similar to build.

dataMother.require
`key => options => object`

Require is used to declare nested dependencies within mother objects.

dataMother.requireArrayOf
`key => options => array<object>`

RequireArrayOf is used to declare dependency arrays within mother objects.

##Examples

A simple mother file might look like this:

    (function(dataMother){
	    
		var myData = {
		    foo: 'bar',
			smallPrimes: [2, 3, 5, 7],
			baz: {
			   quux: 'blar' 
			}
		};
		
		dataMother.register('myData', myData);
		
    })(dataMother);

Using this simple example could look one of two ways:

    //This is an example of a basic build
	var myTestData = dataMother.build('myData');
	
	//This is an array of five instances
	var myTestDataArray = dataMother.buildArrayOf('myData', 5);


A more complex example of a mother file might be like this, using the example above:

    (function(dataMother){
	
	    var myComplexData = {
			id: function(){
				return Math.random() * 1000000;
			},
            myDataProperty: dataMother.require('myData'),
		    myDataArray: dataMother.requireArrayOf('myData')
		};
		
		//Best practice is to define the object with the key you register it with.
		dataMother.register('myComplexData', myComplexData);
	
	})();

This is what the build looks like for more complex mother objects:

    //Please note, the options references the key defined in the mother file
	var myComplexTestData = dataMother.build('myComplexData', { myDataArray: { _count: 3 } });
	
	//You can also build an array of myComplexData instances
	var myComplexTestDataArray = dataMother.build('myComplexData', 2, { myDataArray: { _count: 5 } });