module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: __dirname + "/src/client/index.js",
  output: { filename: "bundle.js" },
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }]
  }
};
