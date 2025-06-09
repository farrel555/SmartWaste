// netlify/functions/get-waste-banks.js (Versi Perbaikan)

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    const Maps_API_KEY = process.env.Maps_API_KEY;
    
    // Ambil latitude dan longitude dari parameter query
    const { lat, lng } = event.queryStringParameters;

    // Jika lat atau lng tidak ada, kembalikan error
    if (!lat || !lng) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Parameter latitude (lat) dan longitude (lng) dibutuhkan.' }),
        };
    }

    const location = `${lat},${lng}`;
    const radius = 5000; // Radius pencarian dalam meter (misal: 5 km)
    const keyword = 'bank sampah';

    // DIUBAH: Gunakan endpoint 'nearbysearch' bukan 'textsearch'
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${Maps_API_KEY}&language=id`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            throw new Error(`Google Places API Error: ${data.status} - ${data.error_message || ''}`);
        }
        
        const locations = data.results.map(place => ({
            name: place.name,
            address: place.vicinity || 'Alamat tidak tersedia', // Nearby search menggunakan 'vicinity'
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
        }));

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