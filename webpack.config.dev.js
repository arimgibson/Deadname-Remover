const main = {
  entry: {
    inject: './build/index.js',
    background: './build/background/background.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  mode: 'development'
}

const settings = {
  entry: {
    options: './build/popup/options.js',
    popup: './build/popup/popup.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist/options'
  },
  mode: 'development'
}

module.exports = [main, settings];
