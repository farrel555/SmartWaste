const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
const Dotenv = require('dotenv-webpack');

// Ini adalah fungsi yang akan diekspor. Webpack akan memanggilnya dan
// meneruskan argumen CLI seperti '--mode development' atau '--mode production'
module.exports = (env, argv) => {
  // Tentukan mode berdasarkan argv yang diberikan oleh Webpack CLI
  // Default ke 'development' jika tidak ditentukan (misal saat menjalankan 'webpack serve' tanpa --mode)
  const isProduction = argv.mode === 'production';
  const mode = argv.mode || 'development';

  // --- Konfigurasi Umum (Common Configuration) ---
  // Bagian ini berlaku untuk mode pengembangan dan produksi.
  const commonConfig = {
    mode: mode, // Akan menjadi 'development' atau 'production'
    entry: {
      main: './src/scripts/index.js', // PATH ini diasumsikan sudah benar sesuai diskusi sebelumnya
    },
    output: {
      filename: isProduction ? '[name].[contenthash].js' : '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      publicPath: '/'
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
              presets: ['@babel/preset-env']
            }
          }
        }
      ],
    },
    plugins: [
      new Dotenv(), 
      new HtmlWebpackPlugin({
        // PERBAIKI PATH INI: Asumsi public/index.html berada di root proyek
        template: './src/public/index.html',
        filename: 'index.html',
        inject: 'body',
      }),
      new InjectManifest({
        // PERBAIKI PATH INI: Asumsi service-worker.js berada di root 'src/'
        // Jika Anda menamainya 'sw.js' dan itu di 'src/', gunakan './src/sw.js'
        // Jika Anda memindahkannya ke 'public/' di root, maka 'public/sw.js'
        // Namun, lokasi standar untuk SW source adalah di 'src/'.
        swSrc: './src/public/sw.js', // Ganti 'sw.js' ke 'service-worker.js' jika itu nama file Anda
        swDest: 'sw.js', // Ganti 'sw.js' ke 'service-worker.js' agar konsisten
        exclude: [
          /\.map$/,
          /manifest\.json$/,
          /\.DS_Store$/
        ],
      }),
    ],
  };

  // --- Konfigurasi Spesifik Pengembangan (Development-Specific Configuration) ---
  if (!isProduction) {
    console.log('--- Webpack: Building for DEVELOPMENT ---');
    Object.assign(commonConfig, {
      devtool: 'eval-source-map',
      devServer: {
        // PATH INI SUDAH BENAR: 'public' di root proyek
        static: {
          directory: path.join(__dirname, 'public'),
          publicPath: '/'
        },
        compress: true,
        port: 8080,
        historyApiFallback: true,
      },
    });
  }

  // --- Konfigurasi Spesifik Produksi (Production-Specific Configuration) ---
  if (isProduction) {
    console.log('--- Webpack: Building for PRODUCTION ---');
    Object.assign(commonConfig, {
      devtool: 'source-map',
      optimization: {
        minimize: true,
      },
    });
  }

  return commonConfig;
};