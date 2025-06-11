// webpack.config.js

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

// --- Konfigurasi Umum (Berlaku untuk semua mode) ---
const commonConfig = {
    // Titik masuk utama aplikasi Anda
    entry: './src/scripts/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js', // Nama file unik untuk production
        clean: true, // Otomatis membersihkan folder 'dist' sebelum build
        publicPath: '/',
    },
    module: {
        rules: [
            // Aturan untuk memproses file CSS
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            // Aturan untuk memproses file JavaScript modern
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
        // Membuat file index.html di 'dist' dari template Anda
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
        }),
        // Menyalin semua file dari folder 'public' ke folder 'dist'
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '.' },
            ],
        }),
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
        filename: 'bundle.js', // Nama file lebih sederhana untuk development
    },
};

// --- Konfigurasi Khusus Production ---
const prodConfig = {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'all',
        },
    },
    plugins: [
        // Service Worker HANYA diaktifkan untuk build production
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

    // Menambahkan DefinePlugin untuk menyediakan process.env.NODE_ENV
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

    return merge(commonConfig, modeConfig, envConfig);
};