const path = require("path");

const main = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "dist/"
  },
  context: __dirname,
  devtool: "source-map",
  mode: "development",
  resolve: {
    modules: ["src", "node_modules"],
    extensions: [".js", ".ts", ".tsx", ".scss", ".css"],
    plugins: []
  },
  module: {
    rules: [
      // {
      //   test: /\.worker\.ts$/,
      //   loader: "worker-loader",
      // },
      {
        test: /\.worker\.js$/,
        loader: "sharedworker-loader"
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.s?[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  }
};

module.exports = main;
