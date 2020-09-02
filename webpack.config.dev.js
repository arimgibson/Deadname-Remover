const main = {
  entry: {
    inject: './build/inject.js',
    background: './build/background.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  mode: 'development'
}

const settings = {
  entry: {
    options: './build/options.js',
    popup: './build/popup.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist/options'
  },
  mode: 'development'
}

module.exports = [main, settings];
