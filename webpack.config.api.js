module.exports = {
    entry: './build/inject.js',
    output: {
        path: __dirname + '/build',
        filename: 'api.js',
        libraryTarget: 'umd2',
        library: 'DeadnameRemover',
    },
    mode: 'production'
}
