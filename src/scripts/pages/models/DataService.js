// src/scripts/pages/models/DataService.js

// Hapus import WasteReport
// import WasteReport from './WasteReport';

// Hapus import dari api.js jika tidak ada lagi API yang dipakai di DataService selain auth
// Atau biarkan jika Anda berencana menggunakannya untuk klasifikasi nanti
//import { getWasteReports as fetchApiWasteReports, submitWasteReport as submitApiWasteReport } from '../../services/api';

class DataService {
    constructor() {
        // useLocalStorage tidak lagi relevan tanpa laporan limbah
        // this.useLocalStorage = false;
    }

    // --- HAPUS: Metode untuk Laporan Limbah (Sudah ada) ---
    // async getWasteReports() { /* ... */ }
    // async submitWasteReport(wasteReport) { /* ... */ }

    // --- Metode Dummy untuk Autentikasi (Backend Belum Ada) ---
    async login(username, password) {
        console.log(`[DataService] Attempting login for: ${username}`);
        return new Promise(resolve => {
            setTimeout(() => {
                if (username === 'user' && password === 'pass') {
                    console.log(`[DataService] Login successful for: ${username}`);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUser', username);
                    resolve(true);
                } else {
                    console.log(`[DataService] Login failed for: ${username}`);
                    resolve(false);
                }
            }, 500);
        });
    }

    async register(username, password) {
        console.log(`[DataService] Attempting registration for: ${username}`);
        return new Promise(resolve => {
            setTimeout(() => {
                if (username === 'admin') {
                    console.log(`[DataService] Registration failed: Username '${username}' is taken.`);
                    resolve(false);
                } else {
                    console.log(`[DataService] Registration successful for: ${username}`);
                    resolve(true);
                }
            }, 500);
        });
    }

    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        console.log('[DataService] User logged out.');
    }

    // --- Tambahkan metode dummy untuk klasifikasi gambar, sebagai pengganti API ML ---
    async classifyImage(imageData) {
        console.log("[DataService] Classifying image (dummy)...");
        return new Promise(resolve => {
            setTimeout(() => {
                const dummyTypes = ['Plastik', 'Kertas', 'Kaca', 'Organik', 'Logam'];
                const randomType = dummyTypes[Math.floor(Math.random() * dummyTypes.length)];

                // Simulasi rekomendasi
                let recommendation = "Sampah ini tidak disarankan untuk kerajinan tangan. Silakan buang sesuai jenisnya.";
                let canBeCrafted = false;
                if (randomType === 'Plastik' || randomType === 'Kertas') {
                    recommendation = `Sampah ${randomType} ini bisa digunakan untuk kerajinan tangan! Tekan 'Lanjutkan' untuk ide-ide.`;
                    canBeCrafted = true;
                }

                resolve({
                    type: randomType,
                    recommendation: recommendation,
                    canBeCrafted: canBeCrafted // Flag untuk menentukan apakah bisa diarahkan ke halaman kerajinan
                });
            }, 1500); // Simulasi waktu proses klasifikasi
        });
    }
}

export default new DataService();