module.exports = {
  mode: "production",
  entry: __dirname + "/src/client/index.js",
  output: { filename: "bundle.js" },
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }]
  }
};
