const webpackConfigAPI = require('./webpack.config.api');
const webpackConfigDev = require('./webpack.config.dev');
const webpackConfigProd = require('./webpack.config.prod');


module.exports = (grunt) => {
  // Project configuration
  grunt.initConfig({
    ts: {
      default: {
        tsconfig: './tsconfig.json'
      },
      api: {
        tsconfig: './tsconfig-api.json'
      }
    },
    webpack: {
      prod: webpackConfigProd,
      dev: webpackConfigDev,
      api: webpackConfigAPI
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

  grunt.registerTask("default", ["ts:default", "webpack:dev", "copy"]);
  grunt.registerTask("production", ["ts:default", "webpack:prod", "copy"]);
  grunt.registerTask("api", ["ts:api", "webpack:api"]);
};
