const inject = {
  entry: './build/inject.js',
  output: {
    filename: './inject.js',
    path: __dirname + '/dist'
  }
}

const background = {
  entry: './build/background.js',
  output: {
    filename: './background.js',
    path: __dirname + '/dist'
  }
}

const options = {
  entry: './build/options.js',
  output: {
    filename: './main.js',
    path: __dirname + '/dist/options'
  }
}

module.exports = [inject, background, options];

