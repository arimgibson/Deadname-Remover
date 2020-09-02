const webpackConfig = require('./webpack.config.dev');

for (i = 0, len = webpackConfig.length; i < len; i++) {
  webpackConfig[i].mode = 'production';
}

module.exports = webpackConfig;
