const webpackConfigProd = require('./webpack.config.prod');
const webpackConfigDev = require('./webpack.config.dev');

module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    ts: {
      default: {
        tsconfig: './tsconfig.json'
      }
    },
    webpack: {
      prod: webpackConfigProd,
      dev: webpackConfigDev
    },
    copy: {
      default: {
        files: [
          {
            expand: true,
            cwd: 'assets/',
            src: '**',
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'html/',
            src: '**',
            dest: 'dist/options/'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks("grunt-contrib-copy");

  grunt.registerTask("default", ["ts", "webpack:dev", "copy"]);
  grunt.registerTask("production", ["ts", "webpack:prod", "copy"]);
};
