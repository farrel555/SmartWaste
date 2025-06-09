// src/utils/googleMapsInitializer.js (Versi Final)

// Ganti dengan kunci API Google Maps Anda yang sebenarnya!
// Sebaiknya, kunci ini juga diambil dari environment variable agar tidak terekspos di repository
const API_KEY = process.env.YOUR_FRONTEND_Maps_KEY; 

let googleMapsApiLoaded = false;

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
        // REKOMENDASI: Tambahkan library `marker` untuk fitur Clustering
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

async function fetchWasteBankLocations() {
    try {
        const response = await fetch('/.netlify/functions/get-waste-banks'); 
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

export async function initWasteBankMap(mapContainerId) {
    try {
        await loadGoogleMapsScript();

        const mapContainer = document.getElementById(mapContainerId);
        if (!mapContainer) {
            throw new Error(`Elemen dengan ID '${mapContainerId}' tidak ditemukan.`);
        }
        mapContainer.innerHTML = ''; 

        const initialLocationIndonesia = { lat: -2.548926, lng: 118.014863 }; 
        const map = new google.maps.Map(mapContainer, {
            zoom: 5,
            center: initialLocationIndonesia,
        });

        const wasteBanks = await fetchWasteBankLocations();

        if (wasteBanks.length === 0) {
            mapContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: gray;">Tidak ada data bank sampah yang tersedia saat ini.</p>';
            return;
        }

        // PENYESUAIAN: Buat array untuk menampung semua marker
        const markers = wasteBanks.map(bank => {
            if (bank.lat && bank.lng && bank.name) {
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(bank.lat), lng: parseFloat(bank.lng) },
                    map: map, // Tetap tampilkan di peta
                    title: bank.name,
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<h3>${bank.name}</h3><p>${bank.address || 'Alamat tidak tersedia'}</p>`,
                });

                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });

                return marker; // Kembalikan marker yang sudah dibuat
            }
            return null; // Kembalikan null jika data tidak lengkap
        }).filter(marker => marker !== null); // Filter untuk menghapus data yang tidak lengkap

        // REKOMENDASI: Terapkan Marker Clustering untuk performa
        // `google.maps.marker.AdvancedMarkerElement` dan `MarkerClusterer` adalah bagian dari library `marker` yang baru.
        new google.maps.marker.MarkerClusterer({ markers, map });
        
        console.log(`Peta bank sampah berhasil diinisialisasi dengan ${markers.length} lokasi.`);

    } catch (error) {
        console.error('Terjadi kesalahan saat menginisialisasi peta:', error);
        // Tampilkan pesan error di UI agar pengguna tahu ada masalah
        const mapContainer = document.getElementById(mapContainerId);
        if (mapContainer) {
            mapContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: red;">Gagal memuat peta. Silakan coba lagi nanti.</p>';
        }
        throw error;
    }
}