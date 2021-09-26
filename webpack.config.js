const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    watch: true,
    entry: {
        index: "./src/index.js",
        resources: "./src/resources.js",
        experiments: "./src/experiments.js",
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin({
            title: "The Secret Website Of Quozul",
            filename: "index.html",
            chunks : ["index"],
            template: "./pages/index.html",
        }),
        new HtmlWebpackPlugin({
            title: "The Secret Library Of Quozul",
            filename: "resources.html",
            chunks : ["resources"],
            template: "./pages/resources.html",
        }),
        new HtmlWebpackPlugin({
            title: "The Secret Laboratory Of Quozul",
            filename: "experiments.html",
            chunks : ["experiments"],
            template: "./pages/experiments.html",
        }),
        new CopyPlugin({
            patterns: [
                { from: "public", to: "public" },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            sassOptions: {
                                outputStyle: "compressed",
                            },
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                ],
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
                options: {
                    minimize: true,
                },
            },
        ],
    },
};