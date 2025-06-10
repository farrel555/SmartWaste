// src/utils/openMapsInitializer.js

// getUserLocation tetap sama, jadi bisa disalin dari file lama
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error('Geolocation tidak didukung.'));
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => reject(new Error('Gagal mendapatkan lokasi.'))
        );
    });
}

// Mengambil data dari Netlify Function Overpass yang baru
async function fetchWasteBankLocations(userLocation) {
    try {
        const response = await fetch(`/.netlify/functions/get-osm-waste-banks?lat=${userLocation.lat}&lng=${userLocation.lng}`);
        if (!response.ok) throw new Error('Gagal memuat data bank sampah.');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Fungsi utama untuk inisialisasi peta dengan Leaflet
export async function initWasteBankMap(mapContainerId) {
    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;
    mapContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Mencari lokasi Anda...</p>';

    try {
        const userLocation = await getUserLocation();
        
        // Inisialisasi peta Leaflet dan pusatkan di lokasi pengguna
        const map = L.map(mapContainerId).setView([userLocation.lat, userLocation.lng], 14);

        // Tambahkan layer latar peta dari OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Tandai lokasi pengguna
        L.marker([userLocation.lat, userLocation.lng], {
            icon: L.divIcon({ className: 'user-location-marker' }) // Butuh sedikit CSS
        }).addTo(map).bindPopup('<b>Lokasi Anda</b>');

        const wasteBanks = await fetchWasteBankLocations(userLocation);

        // Tambahkan marker untuk setiap bank sampah
        wasteBanks.forEach(bank => {
            L.marker([bank.lat, bank.lng])
             .addTo(map)
             .bindPopup(`<b>${bank.name}</b><br>${bank.address}`);
        });

    } catch (error) {
        console.error('Error saat inisialisasi peta Leaflet:', error);
        mapContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: red;">${error.message}</p>`;
    }
}