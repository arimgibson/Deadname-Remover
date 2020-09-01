const inject = {
  entry: './build/inject.js',
  output: {
    filename: './inject.js',
    path: __dirname + '/dist'
  },
  mode: 'production',
}

const background = {
  entry: './build/background.js',
  output: {
    filename: './background.js',
    path: __dirname + '/dist'
  },
  mode: 'production',
}

const options = {
  entry: './build/options.js',
  output: {
    filename: './options.js',
    path: __dirname + '/dist/options'
  },
  mode: 'production',
}

const popup = {
  entry: './build/popup.js',
  output: {
    filename: './popup.js',
    path: __dirname + '/dist/options'
  },
  mode: 'production',
}

module.exports = [inject, background, options, popup];
