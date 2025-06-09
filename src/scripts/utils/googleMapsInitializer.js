// src/utils/googleMapsInitializer.js

// Ambil kunci dari environment variable yang disuntikkan oleh Webpack
const API_KEY = process.env.FRONTEND_Maps_KEY;

let googleMapsApiLoaded = false;

/**
 * Memuat skrip Google Maps API secara dinamis dan hanya sekali.
 * Menambahkan library 'marker' untuk fitur clustering.
 */
function loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
        if (googleMapsApiLoaded) {
            resolve();
            return;
        }

        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
            googleMapsApiLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMapPlaceholder&libraries=marker`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Gagal memuat Google Maps API'));
        document.head.appendChild(script);

        window.initMapPlaceholder = () => {
            googleMapsApiLoaded = true;
            resolve();
            delete window.initMapPlaceholder;
        };
    });
}

/**
 * Mengambil daftar lokasi bank sampah dari Netlify Function.
 * @param {object} userLocation - Objek berisi { lat, lng }
 * @returns {Promise<Array>}
 */
async function fetchWasteBankLocations(userLocation) {
    try {
        const response = await fetch(`/.netlify/functions/get-waste-banks?lat=${userLocation.lat}&lng=${userLocation.lng}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Gagal memuat data: ${response.statusText}`);
        }
        const locations = await response.json();
        return locations;
    } catch (error) {
        console.error('Gagal mengambil data bank sampah:', error);
        return [];
    }
}

/**
 * Meminta izin dan mendapatkan lokasi geografis pengguna.
 * @returns {Promise<object>}
 */
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung oleh browser Anda.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => reject(new Error('Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi.'))
        );
    });
}

/**
 * Fungsi utama untuk menginisialisasi peta dan menampilkan semua marker.
 * @param {string} mapContainerId - ID dari elemen div tempat peta akan dirender.
 */
export async function initWasteBankMap(mapContainerId) {
    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) {
        console.error(`Elemen dengan ID '${mapContainerId}' tidak ditemukan.`);
        return;
    }
    mapContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: gray;">Mencari lokasi Anda...</p>';

    try {
        await loadGoogleMapsScript();
        const userLocation = await getUserLocation();
        
        const map = new google.maps.Map(mapContainer, {
            zoom: 14,
            center: userLocation,
        });

        // Menambahkan marker untuk posisi pengguna
        new google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Lokasi Anda',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "white",
            },
        });

        const wasteBanks = await fetchWasteBankLocations(userLocation);
        if (wasteBanks.length === 0) {
            console.warn('Tidak ada bank sampah terdekat yang ditemukan.');
            return; // Biarkan peta lokasi pengguna tetap tampil
        }

        const markers = wasteBanks.map(bank => {
            const marker = new google.maps.Marker({
                position: { lat: parseFloat(bank.lat), lng: parseFloat(bank.lng) },
                map: map,
                title: bank.name,
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `<h3>${bank.name}</h3><p>${bank.address}</p>`,
            });

            marker.addListener("click", () => infoWindow.open(map, marker));
            return marker;
        }).filter(marker => marker !== null);

        // Menerapkan Marker Clustering untuk performa
        new google.maps.marker.MarkerClusterer({ markers, map });
        
        console.log(`Peta bank sampah berhasil diinisialisasi dengan ${markers.length} lokasi.`);

    } catch (error) {
        console.error('Error saat inisialisasi peta:', error.message);
        mapContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: red;">${error.message}</p>`;
    }
}