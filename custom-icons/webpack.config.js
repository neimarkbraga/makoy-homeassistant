const path = require('path');

module.exports = (env) => {
  const { mode = 'development' } = env;

  return {
    mode,
    target: 'node',
    devtool: 'inline-source-map',
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'icons.bundle.js',
      publicPath: 'public',
    },
    module: {
      rules: [{
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }]
    },
    resolve: {
      extensions: ['.js', '.json', '.svg']
    }
  };
};