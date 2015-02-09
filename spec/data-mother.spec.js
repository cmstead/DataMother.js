(function(){
    'use strict';

    describe('dataMother', function(){

        it('should be an object', function(){
            expect(typeof dataMother).toBe('object');
        });

        describe('build', function(){

            beforeEach(function(){
                dataMother.register('testKey', {
                    id: function(){ return Math.floor(Math.random() * 100); },
                    value: 'static value'
                });
            });

            it('should return an instance of the object stored at the key', function(){
                expect(typeof dataMother.build('testKey')).toBe('object');
            });

            it('should execute initialization functions', function(){
                var testValue = dataMother.build('testKey');

                expect(typeof testValue.id).toBe('number');
            });

            it('should execute initialization functions with option values', function(){
                var passedValue,
                    testPrototype = {
                        id: 1,
                        testValue: ''
                    };

                function init(options){
                    passedValue = options;
                }

                testPrototype.testValue = init;

                dataMother.register('testObj', testPrototype);

                dataMother.build('testObj', {
                    testValue: 'foo'
                });

                expect(passedValue).toBe('foo');
            });

        });

        describe('buildArrayOf', function(){

            beforeEach(function(){
                dataMother.register('testKey', {
                    id: function(){ return Math.floor(Math.random() * 100); },
                    value: 'test value'
                });
            });

            it('should return an array containing a single object when no value is provided', function(){
                expect(dataMother.buildArrayOf('testKey').length).toBe(1);
            });

            it('should return an array of objects', function(){
                expect(dataMother.buildArrayOf('testKey', 5).length).toBe(5);
            });

            it('should call build with provided options', function(){
                var passedValue = [],
                testPrototype = {
                    id: 1,
                    testValue: ''
                };

                function init(options){
                    passedValue.push(options);
                }

                testPrototype.testValue = init;

                dataMother.register('testObj', testPrototype);

                dataMother.buildArrayOf('testObj', 3, {
                    testValue: 'foo'
                });

                expect(JSON.stringify(passedValue)).toBe('["foo","foo","foo"]');
            });

        });

        describe('register', function(){

            it('should register an object to the system', function(){
                dataMother.register('registrationTest', {});

                expect(typeof dataMother.build('registrationTest')).toBe('object');
            });

        });

    });

})();
