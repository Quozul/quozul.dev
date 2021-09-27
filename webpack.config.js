const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require("fs").promises;

const config = {
    watch: true,
    entry: {},
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    mode: "development",
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "public", to: "public"},
                {from: "experiments", to: "experiments"},
                {from: "favicon.ico", to: "favicon.ico"},
                {from: "robots.txt", to: "robots.txt"},
                {from: "sitemap.xml", to: "sitemap.xml"},
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
                    sources: false,
                },
            },
        ],
    },
};

module.exports = async (_env, argv) => {
    config.mode = argv.mode;
    config.watch = argv.mode === "development";

    if (argv.mode === "production") {
        config.devtool = "source-map";
    }

    const pages = await fs.readdir("./pages");

    for (const page of pages) {
        const p = page.split(".")[0];

        const options = {
            filename: page,
            chunks: [],
            template: `./pages/${page}`,
        };

        try {
            if (await fs.stat(`./src/${p}.js`)) {
                options.chunks.push(p);
                config.entry[p] = `./src/${p}.js`;
            }
        } catch (_err) { }

        config.plugins.push(new HtmlWebpackPlugin(options));
    }

    return config;
};