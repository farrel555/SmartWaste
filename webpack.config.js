// webpack.config.js (Versi Final)

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

// --- Konfigurasi Umum (Berlaku untuk semua mode) ---
const commonConfig = {
    // Titik masuk utama aplikasi Anda, sesuai file index.js Anda
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
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    plugins: [
        // Membuat file index.html di 'dist' dari template
        new HtmlWebpackPlugin({
            // Asumsi template HTML utama Anda ada di src/index.html
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
        filename: 'bundle.js',
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
        // InjectManifest hanya untuk build production
        new InjectManifest({
            // Path ke source code service worker Anda. Ganti jika nama filenya beda.
            swSrc: './src/sw.js',
            swDest: 'sw.js',
        }),
    ],
};

// --- Logika Utama untuk Menggabungkan Konfigurasi ---
module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    const modeConfig = isProduction ? prodConfig : devConfig;

    // Membuat objek konfigurasi khusus untuk DefinePlugin
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

    // Gabungkan semua konfigurasi: umum, spesifik mode, dan plugin environment
    return merge(commonConfig, modeConfig, envConfig);
};