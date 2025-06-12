// netlify/functions/get-osm-waste-banks.js

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    const { lat, lng } = event.queryStringParameters;

    if (!lat || !lng) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Parameter lat dan lng dibutuhkan.' }) };
    }

    // Overpass QL: kueri untuk mencari 'amenity=recycling' di sekitar lokasi
    // Bbox (bounding box) dibuat dengan radius ~5km dari lokasi pengguna
    const radius = 0.05; // ~5km dalam derajat lintang/bujur
    const bbox = [
        parseFloat(lat) - radius,
        parseFloat(lng) - radius,
        parseFloat(lat) + radius,
        parseFloat(lng) + radius,
    ].join(',');
    
    const query = `
        [out:json];
        (
          node["amenity"="recycling"](${bbox});
          way["amenity"="recycling"](${bbox});
          relation["amenity"="recycling"](${bbox});
        );
        out center;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Format data dari Overpass API ke format sederhana kita
        const locations = data.elements.map(el => ({
            name: el.tags?.name || "Bank Sampah (Tanpa Nama)",
            address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'Alamat tidak tersedia',
            lat: el.lat || el.center.lat,
            lng: el.lon || el.center.lon,
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(locations),
        };
    } catch (error) {
        console.error('Error di Overpass Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Gagal mengambil data dari Overpass API.' }),
        };
    }
};