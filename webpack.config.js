var HTMLWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  "template": __dirname + '/src/index.html',
  "filename": 'index.html',
  "inject": 'body'
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = {
  "entry": __dirname + '/src/index.js',
  "module": {
    "rules": [
      {
        "test": /\.js$/,
        "exclude": /node_modules/,
        "loader": 'babel-loader'
      },
      {
        "test": /\.sass$/,
        "include": path.resolve(__dirname, "./src/styles"),
        "loaders": ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        "test": /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      }
    ]
  },
  "output": {
    "filename": 'transformed.js',
    "path": __dirname + '/build'
  },
  "plugins": [
      HTMLWebpackPluginConfig,
      new ExtractTextPlugin("styles.css")
  ]
};
