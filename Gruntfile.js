module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            version: '<%= pkg.version %>',
            banner:
                '/**\n' +
                ' * <%= pkg.description %>\n' +
                ' * <%= pkg.version %>\n' +
                ' *\n' +
                ' * <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
                ' * Distributed under <%= pkg.license %> license\n' +
                ' *\n' +
                ' * <%= pkg.homepage %>\n' +
                ' */\n'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: ['src/**/*.js', 'Gruntfile.js']
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>;(function() {\n"use strict";\n\n',
                footer: '\n})(window || global || this);',
                sourceMap: true
            },
            dist: {
                src: [
                    'src/models/FormModel.js',
                    'src/views/FormView.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            min: {
                options: {
                    beautify: false,
                    compress: {},
                    report: 'gzip'
                },
                files: {
                    'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
                }
            }
        },
        watch: {
            js: {
                files: ['package.json', 'Gruntfile.js', 'src/**/*.js'],
                tasks: ['jshint', 'concat', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'watch']);
};