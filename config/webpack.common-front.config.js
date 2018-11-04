const _ = require("lodash");

const common = require("common");
const util = common.webpack;
const paths = common.paths;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const webpack = require("webpack");

// config.plugins.push(
//   new CopyWebpackPlugin([
//     {
//       context: "static",
//       from: "**/*",
//       to: "./"
//     }
//   ])
// );

module.exports = function({
  env,
  argv,
  useWorkBox,
  useHot,
  useCodeSplitting,
  serverContentBase,
  indexHtmlTemplatePath
}) {
  const envIsTesting = util.envIsTesting(env);
  const devMode = process.env.NODE_ENV !== "production";

  const config = {
    output: {},
    target: "web",
    plugins: {
      miniCssExtract: new MiniCssExtractPlugin({
        filename: devMode ? "[name].css" : "[name].[hash].css",
        chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
      })
    },
    module: {
      rules: {
        images: {
          use: [
            {
              loader: "file-loader",
              options: {
                emitFile: true
              }
            }
          ]
        },
        fonts: {
          use: [
            {
              loader: "file-loader",
              options: {
                emitFile: true
              }
            }
          ]
        }
      }
    },
    optimization: {
      minimizer: {
        optimizeCSSAssets: new OptimizeCSSAssetsPlugin({})
      }
    },
    devServer: {
      hot: useHot,
      contentBase: serverContentBase,
      // TODO: move to salami
      proxy: {
        "/faye": {
          target: "ws://localhost:20000/faye",
          ws: true
        }
      },
      overlay: true
    }
  };

  if (useWorkBox) {
    let workBoxOptions = {
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true
    };
    config.plugins.workBox = new WorkboxPlugin.GenerateSW(workBoxOptions);
  }

  if (useHot) {
    config.plugins.hot = new webpack.HotModuleReplacementPlugin();
    // https://github.com/webpack/webpack/issues/6642
    config.output.globalObject = "this";
  }

  if (useCodeSplitting) {
    config.plugins.hashedModuleIds = new webpack.HashedModuleIdsPlugin();
    config.optimization = config.optimization || {};
    (config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }),
      (config.optimization.runtimeChunk = "single");
  }

  if (!envIsTesting) {
    config.plugins.html = new HtmlWebpackPlugin({
      template: indexHtmlTemplatePath
    });
  }

  if (process.env.BUNDLE_ANALYZER) {
    config.plugins.bundleAnalyzer = new BundleAnalyzerPlugin();
  }

  return config;
};
