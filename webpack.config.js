/* eslint-disable @typescript-eslint/no-require-imports */
// webpack.cli.js

const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './bin/abimongo-scaffold.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'abimongo-scaffold.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }]
  },
  externals: {
    'fsevents': 'commonjs fsevents'
  }
};




















// import path from 'path';
// import { fileURLToPath } from 'url';
// import { CleanWebpackPlugin } from 'clean-webpack-plugin';
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export default {
//   mode: 'production',
//   target: 'node',
//   entry: './src/abimongo-cli/index.ts',
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: 'cli.js',
//   },
//   resolve: {
//     extensions: ['.ts', '.js'],
//   },
//   module: {
//     rules: [
//       {
//         test: /\.ts$/,
//         loader: 'ts-loader',
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   externalsPresets: { node: true },
//   externals: {
//     fs: 'commonjs fs',
//     path: 'commonjs path',
//     child_process: 'commonjs child_process',
//   },
// 	plugins: [
// 			new CleanWebpackPlugin({
// 			cleanStaleWebpackAssets: false,
// 			cleanOnceBeforeBuildPatterns: ['**/*', '!records.json'],
// 			cleanAfterEveryBuildPatterns: ['**/*', '!records.json'],
// 		}),
// 	],
// };
