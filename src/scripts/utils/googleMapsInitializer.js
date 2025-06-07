// src/utils/googleMapsInitializer.js

const API_KEY = 'AIzaSyCWvYV88IJm5yprtKdbkGkY3PgHK8BcX9A'; // Ganti dengan kunci API Google Maps Anda yang sebenarnya!

let googleMapsApiLoaded = false; // Flag untuk memastikan API hanya dimuat sekali

// Fungsi untuk memuat Google Maps API secara dinamis
function loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
        if (googleMapsApiLoaded) {
            resolve(); // API sudah dimuat sebelumnya
            return;
        }

        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
            // API sudah dimuat tetapi flag belum di-set
            googleMapsApiLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMapPlaceholder`;
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

// Fungsi untuk mengambil data bank sampah dari backend (CONTOH)
async function fetchWasteBankLocations() {
    try {
        // Ganti URL ini dengan endpoint API backend Anda yang sebenarnya
        // yang mengembalikan daftar bank sampah di seluruh Indonesia
        const response = await fetch('https://api.yourdomain.com/waste-banks-indonesia'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Harusnya berupa array objek { lat, lng, name, address }
    } catch (error) {
        console.error('Gagal mengambil data bank sampah:', error);
        return []; // Kembalikan array kosong jika gagal
    }
}


// Fungsi untuk menginisialisasi dan menampilkan peta bank sampah
export async function initWasteBankMap(mapContainerId) {
    try {
        await loadGoogleMapsScript(); // Pastikan API sudah dimuat

        const mapContainer = document.getElementById(mapContainerId);
        if (!mapContainer) {
            throw new Error(`Elemen dengan ID '${mapContainerId}' tidak ditemukan.`);
        }

        // Jika Anda ingin membersihkan konten "Loading map..."
        mapContainer.innerHTML = ''; 

        // Koordinator untuk titik tengah Indonesia (misalnya di sekitar Jawa Tengah)
        // Zoom level yang cocok untuk melihat seluruh Indonesia (sekitar 5-6)
        const initialLocationIndonesia = { lat: -2.548926, lng: 118.014863 }; 
        const map = new google.maps.Map(mapContainer, {
            zoom: 5, // Zoom level 5 biasanya cukup baik untuk melihat seluruh Indonesia
            center: initialLocationIndonesia,
            // Anda bisa menambahkan opsi lain seperti disableDefaultUI: true, gestureHandling: 'greedy'
        });

        // Ambil data bank sampah dari backend
        const wasteBanks = await fetchWasteBankLocations();

        if (wasteBanks.length === 0) {
            console.warn('Tidak ada data bank sampah yang ditemukan.');
            // Tampilkan pesan di peta jika tidak ada data
            mapContainer.innerHTML = '<p style="text-align: center; color: gray;">Tidak ada data bank sampah yang tersedia.</p>';
            return;
        }

        // Tambahkan marker untuk setiap bank sampah yang diambil
        wasteBanks.forEach(bank => {
            if (bank.lat && bank.lng && bank.name) { // Pastikan data koordinat dan nama ada
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(bank.lat), lng: parseFloat(bank.lng) },
                    map: map,
                    title: bank.name,
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<h3>${bank.name}</h3><p>${bank.address || 'Alamat tidak tersedia'}</p>`,
                });

                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });
            } else {
                console.warn('Data bank sampah tidak lengkap:', bank);
            }
        });

        console.log(`Peta bank sampah berhasil diinisialisasi dengan ${wasteBanks.length} lokasi.`);

    } catch (error) {
        console.error('Terjadi kesalahan saat menginisialisasi peta:', error);
        // Penting: re-throw error agar bisa ditangani di pemanggil (DashboardView)
        throw error; 
    }
}