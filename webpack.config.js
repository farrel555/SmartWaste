// webpack.config.js (Versi Definitif)

const path = require('path');
const webpack = require('webpack'); // Pastikan webpack di-impor
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
const Dotenv = require('dotenv-webpack'); // Kita gunakan ini untuk cara yang paling stabil

// --- Konfigurasi Umum ---
const commonConfig = {
    entry: './src/scripts/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        clean: true,
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { presets: ['@babel/preset-env'] },
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: 'public', to: '.' }],
        }),
        // Gunakan Dotenv untuk memuat variabel dari file .env
        new Dotenv(),
    ],
};

// --- Konfigurasi Development ---
const devConfig = {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: { directory: path.resolve(__dirname, 'public') },
        compress: true,
        port: 8080,
        open: true,
        historyApiFallback: true,
    },
    output: {
        filename: 'bundle.js',
    },
};

// --- Konfigurasi Production ---
const prodConfig = {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new InjectManifest({
            swSrc: './src/sw.js',
            swDest: 'sw.js',
        }),
    ],
};

// --- Logika Utama ---
module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        return merge(commonConfig, prodConfig);
    }
    return merge(commonConfig, devConfig);
};