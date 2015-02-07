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

        });

        describe('register', function(){

            it('should register an object to the system', function(){
                dataMother.register('registrationTest', {});

                expect(typeof dataMother.build('registrationTest')).toBe('object');
            });

        });

    });

})();
