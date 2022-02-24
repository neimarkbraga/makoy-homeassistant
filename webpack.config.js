const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

const OUTPUT_FILENAME = 'app.bundle.js';

module.exports = (env) => {
  const { mode = 'development' } = env;

  return {
    mode,
    devtool: mode === 'development' ? 'inline-cheap-module-source-map' : 'source-map',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, (mode === 'development' ? '.dev' : 'dist')),
      filename: OUTPUT_FILENAME
    },
    optimization: {
      minimize: mode === 'production',
      minimizer: [new TerserPlugin()]
    },
    plugins: [
      new Dotenv({
        path: mode === 'development' ? './.env.dev' : './.env.prod'
      })
    ],
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.svg$/,
          loader: 'raw-loader'
        },
        {
          test: /\.module.s[ac]ss$/,
          use: [
            'raw-loader',
            'sass-loader'
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js', '.svg', '.scss'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    stats: "minimal",
    devServer: {
      host: 'local-ip',
      allowedHosts: 'all',
      port: 8080,
      hot: true,
      watchFiles: ['src/**/*'],
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  };
};