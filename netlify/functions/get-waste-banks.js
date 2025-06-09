// netlify/functions/get-waste-banks.js

// Kita menggunakan require karena ini lingkungan Node.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    // Ambil Kunci API dari environment variables yang sudah kita set di Netlify
    const Maps_API_KEY = process.env.Maps_API_KEY;

    // Kueri pencarian yang akan kita kirim ke Google
    const query = "bank sampah di Indonesia";

    // URL endpoint Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=<span class="math-inline">\{encodeURIComponent\(query\)\}&key\=</span>{Maps_API_KEY}&language=id`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK") {
            // Jika Google mengembalikan error, kita teruskan pesannya
            throw new Error(`Google Places API Error: ${data.status} - ${data.error_message || ''}`);
        }

        // Format ulang data dari Google agar lebih sederhana untuk frontend
        const locations = data.results.map(place => ({
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
        }));

        // Kirim kembali data yang sudah diformat ke frontend
        return {
            statusCode: 200,
            body: JSON.stringify(locations),
        };
    } catch (error) {
        console.error('Error di Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Gagal mengambil data dari Google Places API.' }),
        };
    }
};