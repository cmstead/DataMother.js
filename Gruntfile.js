var cleanConfig = require('./grunt/clean.json'),
    copyConfig = require('./grunt/copy.json'),
    jshintConfig = require('./grunt/jshint.json'),
    karmaConfig = require('./grunt/karma.json');

module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: cleanConfig,
        copy: copyConfig,
        jshint: jshintConfig,
        karma: karmaConfig,
    });

    /* Load grunt task adapters */

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');

    /* Register composite grunt tasks */

    grunt.registerTask('test', ['jshint', 'karma']);

    grunt.registerTask('build', ['clean', 'test', 'copy']);

    grunt.registerTask('default', ['test']);
};
