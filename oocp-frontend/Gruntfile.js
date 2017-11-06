// Generated on 2013-11-27 using generator-angular 0.6.0-rc.2
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);
	
	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Project settings
		dcom: {
			// configurable paths
			app: 'app',
			deploy: 'deploy'
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'<%= dcom.app %>/scripts/{,*/}*.js',
				'!<%= dcom.app %>/scripts/vendor/*.js'
			]
		},

		compass: {
			deploy: {
				options: {
					cssDir: '.tmp/styles'
				}
			}
		},

		// Empties folders to start fresh
		clean: {
			deploy: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= dcom.deploy %>/*',
						'!<%= dcom.deploy %>/.git*'
					]
				}]
			}
		},

		// Renames files for browser caching purposes
		rev: {
			deploy: {
				files: {
					src: [
						'<%= dcom.deploy %>/scripts/{,*/}*.js',
						'<%= dcom.deploy %>/styles/{,*/}*.css',
						'<%= dcom.deploy %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
						'<%= dcom.deploy %>/styles/fonts/*'
					]
				}
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			html: '<%= dcom.app %>/index.html',
			options: {
				dest: '<%= dcom.deploy %>'
			}
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			html: ['<%= dcom.deploy %>/{,*/}*.html', '<%= dcom.deploy %>/views/**/*.html', '<%= dcom.deploy %>/index.php'],
			css: ['<%= dcom.deploy %>/styles/{,*/}*.css'],
			options: {
				assetsDirs: ['<%= dcom.deploy %>']
			}
		},

		// The following *-min tasks produce minified files in the deploy folder
		imagemin: {
			deploy: {
				files: [{
					expand: true,
					cwd: '<%= dcom.app %>/images',
					src: '{,*/}*.{png,jpg,jpeg,gif}',
					dest: '<%= dcom.deploy %>/images'
				}]
			}
		},
		svgmin: {
			deploy: {
				files: [{
					expand: true,
					cwd: '<%= dcom.app %>/images',
					src: '{,*/}*.svg',
					dest: '<%= dcom.deploy %>/images'
				}]
			}
		},
		htmlmin: {
			deploy: {
				options: {
					// Optional configurations that you can uncomment to use
					// removeCommentsFromCDATA: true,
					// collapseBooleanAttributes: true,
					// removeAttributeQuotes: true,
					// removeRedundantAttributes: true,
					// useShortDoctype: true,
					// removeEmptyAttributes: true,
					// removeOptionalTags: true*/
				},
				files: [{
					expand: true,
					cwd: '<%= dcom.app %>',
					src: ['*.php', '*.html', 'views/{,*/}*.html'],
					dest: '<%= dcom.deploy %>'
				}]
			}
		},

		//replace dev things with prod things
		preprocess: {
			staging: {
				src: '<%= dcom.deploy %>/index.html',
				options: {
					inline: true,
					context: {
						env: 'staging'
					}
				}
			},
			prod: {
				src: '<%= dcom.deploy %>/index.html',
				options: {
					inline: true,
					context: {
						env: 'production'
					}
				}
			}
		},

		// Allow the use of non-minsafe AngularJS files. Automatically makes it
		// minsafe compatible so Uglify does not destroy the ng references
		ngmin: {
			deploy: {
				files: [{
					expand: true,
					cwd: '.tmp/concat/scripts',
					src: '*.js',
					dest: '.tmp/concat/scripts'
				}]
			}
		},

		cdnify: {
			deploy: {
				html: ['<%= dcom.deploy %>/index.html']
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			deploy: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= dcom.app %>',
					dest: '<%= dcom.deploy %>',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						//bower components referenced directly to cut down on unnecessary files deployed
						//not handled by concat/min because of conditional comments
						'bower_components/es5-shim/es5-shim.js',
						'bower_components/json3/lib/json3.min.js',
						//needed because imagemin isn't working
						'images/**/*',
						//'images/{,*/}*.{webp}',
						'styles/fonts/*'
					]
				}, {
					expand: true,
					cwd: '.tmp/images',
					dest: '<%= dcom.deploy %>/images',
					src: [
						'generated/*'
					]
				}]
			}
		},

		// Run some tasks in parallel to speed up the build process
		concurrent: {
			deploy: [
				'compass:deploy',
				//there is a bug currently in imagemin 0.4.0 where it is unable to process jpeg
				//'imagemin',
				'svgmin',
				'htmlmin'
			]
		}
	});

	grunt.registerTask('build', function(env) {
		if (env === 'staging'){
			grunt.task.run(
				'clean:deploy',
				'useminPrepare',
				'concurrent:deploy',
				'preprocess:staging',
				'concat',
				'ngmin',
				'copy:deploy',
				'cdnify',
				'cssmin',
				'uglify',
				'rev',
				'usemin'
			);
		} else {
			grunt.task.run(
				'clean:deploy',
				'useminPrepare',
				'concurrent:deploy',
				'preprocess:prod',
				'concat',
				'ngmin',
				'copy:deploy',
				'cdnify',
				'cssmin',
				'uglify',
				'rev',
				'usemin'
			);	
		}
		
	});

	grunt.registerTask('test', [
		'jshint'
	]);
};
