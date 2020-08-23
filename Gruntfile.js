const webpackConfig = require('./webpack.config');

module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    ts: {
      default: {
        tsconfig: './tsconfig.json'
      }
    },
    webpack: {
      prod: webpackConfig
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
            src: 'html/options.html',
            dest: 'dist/options/index.html'
          },
          {
            src: 'html/options.css',
            dest: 'dist/options/options.css'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks("grunt-contrib-copy");

  grunt.registerTask("default", ["ts", "webpack", "copy"]);
};
