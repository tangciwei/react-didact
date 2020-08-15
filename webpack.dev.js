"use strict";

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: "./src/index.tsx",
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "my.js",
    },
    mode: "development",
    // devtool: 'inline-source-map',
    resolve: {
        extensions: [".ts", ".js", '.tsx'],
    },
    module: {
        rules: [
            // {
            //     test: /\.ts?$/,
            //     use: "ts-loader",
            //     exclude: /node_modules/,
            // },

            // {
            //     test: /\.(js|mjs|jsx|ts|tsx)$/,
            //     enforce: 'pre',
            //     use: [
            //         "ts-loader"
            //     ],
            // },
            {
                test: /\.(tsx?)|(js)$/,
                use:
                {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: [
                            [
                                "@babel/plugin-transform-react-jsx",
                                { pragma: "Didact.createElement" },
                            ],
                        ],
                    },
                }

            }

            // {
            //     test: /.js$/,
            //     use: "babel-loader",
            // },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src/index.html"),
            filename: "index.html",
            chunks: ["index"],
            inject: true,
            minify: {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false,
            },
        }),
    ],
    // devServer: {
    //     contentBase: "./dist",
    //     hot: true,
    // },
};
