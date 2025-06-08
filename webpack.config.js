// webpack.config.js (Versi Final untuk Netlify Identity & PWA)

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
        filename: 'bundle.[contenthash].js', // Nama file unik untuk cache busting di production
        clean: true, // Otomatis membersihkan folder 'dist' sebelum build
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
            template: './src/index.html', // Path ke template HTML Anda
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
            // Menyajikan file statis dari folder 'public' saat development
            directory: path.resolve(__dirname, 'public'),
        },
        compress: true,
        port: 8080,
        open: true,
        historyApiFallback: true, // Penting untuk Single Page Application
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
        minimize: true, // Mengecilkan ukuran file
        splitChunks: {
            chunks: 'all', // Memisahkan library ke file terpisah
        },
    },
    plugins: [
        // Service Worker HANYA diaktifkan untuk build production
        new InjectManifest({
            swSrc: './src/sw.js', // Path ke source code service worker Anda
            swDest: 'sw.js',     // Nama file service worker di folder output
        }),
    ],
};

// --- Logika Utama untuk Menggabungkan Konfigurasi ---
module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    // Menambahkan DefinePlugin untuk menyediakan process.env.NODE_ENV ke kode frontend
    // Diambil dari mode yang sedang berjalan
    commonConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(argv.mode),
        })
    );

    if (isProduction) {
        console.log('--- Menjalankan build untuk PRODUCTION ---');
        return merge(commonConfig, prodConfig);
    } else {
        console.log('--- Menjalankan server untuk DEVELOPMENT ---');
        return merge(commonConfig, devConfig);
    }
};