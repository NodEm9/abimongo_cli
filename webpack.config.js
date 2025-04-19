/* eslint-disable @typescript-eslint/no-require-imports */
// webpack.cli.js

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './bin/abimongo_cli.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist/bin'),
    filename: 'abimongo_cli.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }]
  },
  externals: {
    'fsevents': 'commonjs fsevents'
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.emit.tapAsync('AddShebangPlugin', (compilation, callback) => {
          const content = compilation.assets['abimongo_cli.js'].source();
          compilation.assets['abimongo_cli.js'] = {
            source: () => `#!/usr/bin/env node\n${content}`,
            size: () => content.length + '#!/usr/bin/env node\n'.length,
          };
          callback();
        });
      },
    },
  ],
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
