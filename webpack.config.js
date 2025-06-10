// webpack.config.js

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

// Kita tidak lagi memerlukan Dotenv karena menggunakan Netlify Identity

// --- Konfigurasi Umum (Berlaku untuk semua mode) ---
const commonConfig = {
    entry: './src/scripts/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        clean: true,
        publicPath: '/',
    },
    // DIKEMBALIKAN: Aturan untuk memproses file JavaScript dan CSS
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
                    options: {
                        presets: ['@babel/preset-env'],
                    },
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
            patterns: [
                { from: 'public', to: '.' },
            ],
        }),
        // Plugin Dotenv dihapus karena tidak lagi diperlukan
    ],
};

// --- Konfigurasi Khusus Development ---
const devConfig = {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'public'),
        },
        compress: true,
        port: 8080,
        open: true,
        historyApiFallback: true,
    },
    output: {
        filename: 'bundle.js',
    },
};

// --- Konfigurasi Khusus Production ---
const prodConfig = {
    mode: 'production',
    devtool: 'source-map',
    // DIKEMBALIKAN: Opsi optimisasi untuk production build
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'all',
        },
    },
    plugins: [
        new InjectManifest({
            swSrc: './src/sw.js',
            swDest: 'sw.js',
        }),
    ],
};

// --- Logika Utama untuk Menggabungkan Konfigurasi ---
module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    const modeConfig = isProduction ? prodConfig : devConfig;

    // Konfigurasi untuk DefinePlugin (diperlukan agar 'process.env.NODE_ENV' berfungsi di PWA)
    const envConfig = {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(argv.mode),
            }),
        ],
    };

    if (isProduction) {
        console.log('--- Menjalankan build untuk PRODUCTION ---');
    } else {
        console.log('--- Menjalankan server untuk DEVELOPMENT ---');
    }

    // Gabungkan semua konfigurasi yang relevan
    return merge(commonConfig, modeConfig, envConfig);
};