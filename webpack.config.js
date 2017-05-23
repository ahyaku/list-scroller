module.exports = {
    entry: "./renderer.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    externals: [
      'fs'
    ],
    target: 'electron-renderer',
    module: {
        loaders: [
            { 
              test: /\.css$/,
              exclude: /node_modules/,
              loader: 'style!css'
            },
            { test: /\.js$/,
              exclude: /node_modules/,
              loader: 'babel-loader',
              query: {
                presets: ['react', 'es2015']
              }
            }
        ]
    }
};

