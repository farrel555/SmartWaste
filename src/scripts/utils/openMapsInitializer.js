// Fungsi untuk mendapatkan lokasi pengguna, tidak berubah
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error('Geolocation tidak didukung oleh browser Anda.'));
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => reject(new Error('Gagal mendapatkan lokasi. Izinkan akses lokasi di browser Anda.'))
        );
    });
}

// DIUBAH: Mengambil data dari API FastAPI Anda
async function fetchWasteBankLocations(userLocation) {
    // Ganti dengan URL API dari Fly.io atau layanan hosting Anda
    const API_BASE_URL = 'https://smartwaste-api.fly.dev'; 

    try {
        const response = await fetch(`${API_BASE_URL}/waste-banks?lat=${userLocation.lat}&lon=${userLocation.lng}`);
        if (!response.ok) {
            throw new Error(`Gagal memuat data bank sampah dari API (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error saat mengambil data bank sampah:', error);
        return []; // Kembalikan array kosong jika gagal
    }
}

// Fungsi utama untuk inisialisasi peta dengan Leaflet
export async function initWasteBankMap(mapContainerId) {
    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) {
        console.error(`Elemen dengan ID '${mapContainerId}' tidak ditemukan.`);
        return;
    }
    mapContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: gray;">Mencari lokasi Anda...</p>';

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
        L.marker([userLocation.lat, userLocation.lng]).addTo(map).bindPopup('<b>Lokasi Anda</b>');

        const wasteBanks = await fetchWasteBankLocations(userLocation);

        if (wasteBanks.length > 0) {
            // Tambahkan marker untuk setiap bank sampah
            wasteBanks.forEach(bank => {
                L.marker([bank.lat, bank.lon]) // Perhatikan: Overpass API menggunakan 'lon' bukan 'lng'
                 .addTo(map)
                 .bindPopup(`<b>${bank.name}</b><br>${bank.address}`);
            });
        } else {
            console.log("Tidak ada bank sampah ditemukan di sekitar lokasi ini.");
        }

    } catch (error) {
        console.error('Error saat inisialisasi peta Leaflet:', error);
        mapContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: red;">${error.message}</p>`;
    }
}