const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: './app/javascripts/index.js',
    search: './app/javascripts/search.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  plugins: [
    // defined plugins should have a corresponding require() on the top
    // https://webpack.js.org/plugins/

    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/about.html', to: "about.html" },
      { from: './app/blank.html', to: "blank.html" },
      { from: './app/find.html', to: "find.html" },
      { from: './app/index.html', to: "index.html" },
      { from: './app/webelements.html', to: "webelements.html" },
    ]), 
    new webpack.ProvidePlugin({
        // Make jQuery / $ available in every module:
        $: 'jquery',
        jQuery: 'jquery',
        // NOTE: Required to load jQuery Plugins into the *global* jQuery instance:
        jquery: 'jquery'
      })
  ],
  resolve: {
    alias : {
      'jquery': require.resolve('jquery')
    }
  },
  module: {
    rules: [
      { 
        // https://webpack.js.org/loaders/less-loader/
        // https://github.com/mar10/fancytree/wiki/TutorialIntegration 
        test: /\.less$/, 
        use: ["style-loader", "css-loader", "less-loader"]
      }, 
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      },
      { test: /\.(?:png|jpe?g|svg|gif)$/i, use: [ { loader: 'url-loader', options: {
        limit: 10000  // Inline images smaller than 10kb as data URIs
        } } ]
      }
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      { test: /\.css$/, use: 'css-loader'},
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  }
}
