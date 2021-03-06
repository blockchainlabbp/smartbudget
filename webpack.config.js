const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

// ? : Suppresses warning that would otherwise show up in browser console
// https://github.com/webpack-contrib/webpack-hot-middleware/issues/228
module.exports = {
  entry: {
    about: './app/javascripts/about.js',
    apply_node: './app/javascripts/apply_node.js',
    candidate_details: './app/javascripts/candidate_details.js',
    create_node: './app/javascripts/create_node.js',
    create_project: './app/javascripts/create_project.js',
    find: './app/javascripts/find.js',
    index: './app/javascripts/index.js',
    my_projects: './app/javascripts/my_projects.js',
    node_details: './app/javascripts/node_details.js',
    project_details: './app/javascripts/project_details.js',
    smartbudgetservice: './app/javascripts/smartbudgetservice.js',
  },
  // Log level for the final build - in the npm console
  stats: 'normal',
  optimization: {
    minimize: true
  },
  devServer: {
    // Log level for the dev server - in the browser
    clientLogLevel: 'error',
    // Log level for the final build - in the npm console
    stats: 'normal'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  plugins: [
    // defined plugins should have a corresponding require() on the top
    // https://webpack.js.org/plugins/
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/images', to:'images'},
      { from: './app/stylesheets/app.css', to: "app.css" },
      { from: './app/stylesheets/main.css', to: "main.css" },
      { from: './app/about.html', to: "about.html" },
      { from: './app/apply_node.html', to: "apply_node.html" },
      { from: './app/candidate_details.html', to: "candidate_details.html" },
      { from: './app/create_node.html', to: "create_node.html" },
      { from: './app/create_project.html', to: "create_project.html" },
      { from: './app/find.html', to: "find.html" },
      { from: './app/index.html', to: "index.html" },
      { from: './app/my_projects.html', to: "my_projects.html" },
      { from: './app/node_details.html', to: "node_details.html" },
      { from: './app/project_details.html', to: "project_details.html" },
      { from: './app/webelements.html', to: "webelements.html" },
    ]), 
    new webpack.ProvidePlugin({
        // Make jQuery / $ available in every module, without the need to import it always
        // https://webpack.js.org/plugins/provide-plugin/
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
    ]
  }
}
