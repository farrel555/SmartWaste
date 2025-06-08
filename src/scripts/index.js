// src/scripts/index.js (Versi Perbaikan Final)

import '../styles/main.css';
import { initializeApp } from './pages/app'; // Path ke app.js Anda

// Jalankan logika utama aplikasi setelah DOM siap
document.addEventListener('DOMContentLoaded', initializeApp);

// Logika untuk mendaftarkan Service Worker (Hanya di mode Production)
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // Gunakan event 'load' agar tidak mengganggu proses render awal halaman
    window.addEventListener('load', () => {
        // Panggil API browser untuk mendaftarkan Service Worker
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker berhasil didaftarkan. Cakupan:', registration.scope);
            })
            .catch(registrationError => {
                console.error('Registrasi Service Worker gagal:', registrationError);
            });
    });
}