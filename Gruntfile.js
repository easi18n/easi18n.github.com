// Generated on 2013-03-21 using generator-webapp 0.1.5
'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    config: {
      app: 'app',
      dist: 'dist',
      tmp: '.tmp',
      test: 'test',
      scripts: '<%= config.app %>/scripts',
      styles: '<%= config.app %>/styles',
      images: '<%= config.app %>/images',
      distScripts: '<%= config.dist %>/scripts',
      distStyles: '<%= config.dist %>/styles',
      distImages: '<%= config.dist %>/images',
      tmpScripts: '<%= config.tmp %>/scripts',
      tmpStyles: '<%= config.tmp %>/styles'
    },
    watch: {
      recess: {
        files: ['<%= config.styles %>/main.less'],
        tasks: ['recess:server']
      },
      livereload: {
        files: [
          '<%= config.app %>/*.html',
          '{<%= config.tmpStyles %>,<%= config.styles %>}/{,*/}*.css',
          '{<%= config.tmpScripts %>,<%= config.app %>}/{,*/}*.js',
          '<%= config.images %>/{,*/}*.{png,jpg,jpeg,webp}'
        ],
        tasks: ['livereload']
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'app')

            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    clean: {
      dist: ['<%= config.tmp %>', '<%= config.dist %>/*', '!<%= config.dist %>/.git'],
      server: '<%= config.tmp %>'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= config.scripts %>/{,*/}*.js',
        '!<%= config.scripts %>/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },
    recess: {
      dist: {
        options: {
          compile: true
        },
        files: {
          '.tmp/styles/main.css': ['<%= config.styles %>/main.less']
        }
      },
      server: {
        options: {
          compile: true
        },
        files: {
          '.tmp/styles/main.css': ['<%= config.styles %>/main.less']
        }
      }
    },
    concat: {
      dist: {},
      bootstrap: {
        src: ['<%= config.scripts %>/vendor/bootstrap/bootstrap-transition.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-dropdown.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-collapse.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-modal.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-affix.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-alert.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-button.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-carousel.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-tooltip.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-popover.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-scrollspy.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-tab.js',
          '<%= config.scripts %>/vendor/bootstrap/bootstrap-typeahead.js'
        ],
        dest: '<%= config.scripts %>/vendor/bootstrap.js'
      }
    },
    requirejs: {
      dist: {
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          // `name` and `out` is set by grunt-usemin
          baseUrl: 'app/scripts',
          optimize: 'none',
          // TODO: Figure out how to make sourcemaps work with grunt-usemin
          // https://github.com/config/grunt-usemin/issues/30
          //generateSourceMaps: true,
          // required to support SourceMaps
          // http://requirejs.org/docs/errors.html#sourcemapcomments
          preserveLicenseComments: false,
          useStrict: true,
          wrap: true
          //uglify2: {} // https://github.com/mishoo/UglifyJS2
        }
      }
    },
    useminPrepare: {
      html: '<%= config.app %>/index.html',
      options: {
        dest: '<%= config.dist %>'
      }
    },
    usemin: {
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.distStyles %>/{,*/}*.css'],
      options: {
        dirs: ['<%= config.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.images %>',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= config.distImages %>'
        }]
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%= config.distStyles %>/main.css': [
            '.tmp/styles/{,*/}*.css',
            '<%= config.styles %>/{,*/}*.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/config/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          src: '*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,txt}',
            '.htaccess'
          ]
        }]
      }
    },
    bower: {
      all: {
        rjsConfig: '<%= config.scripts %>/main.js'
      }
    }
  });

  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concat',
      'recess:server',
      'livereload-start',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'recess',
    'connect:test',
    'mocha'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'concat',
    'recess:dist',
    'useminPrepare',
    'requirejs',
    'imagemin',
    'htmlmin',
    'cssmin',
    'uglify',
    'copy',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
