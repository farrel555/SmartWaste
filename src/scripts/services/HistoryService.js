// src/scripts/services/HistoryService.js (Versi Final)

import AuthService from './AuthService';

class HistoryService {
    async saveScanHistory(scanData) {
        const user = AuthService.getCurrentUser();

        // Pengecekan penting untuk memastikan user dan token ada
        if (!user || !user.token || !user.token.access_token) {
            console.error('saveScanHistory: Pengguna tidak valid atau token tidak ditemukan. Proses dibatalkan.');
            return Promise.reject(new Error('Pengguna tidak valid atau token tidak ditemukan.'));
        }

        try {
            const response = await fetch('/.netlify/functions/save-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // BAGIAN KRUSIAL: Mengirim token sebagai bukti login
                    'Authorization': `Bearer ${user.token.access_token}`
                },
                body: JSON.stringify(scanData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menyimpan riwayat.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error in saveScanHistory:', error);
            throw error;
        }
    }

    async getScanHistory() {
        const user = AuthService.getCurrentUser();

        if (!user || !user.token || !user.token.access_token) {
            console.error('getScanHistory: Pengguna tidak terautentikasi. Proses dibatalkan.');
            return Promise.reject(new Error('Pengguna tidak terautentikasi.'));
        }

        try {
            const response = await fetch('/.netlify/functions/get-history', {
                headers: {
                    // BAGIAN KRUSIAL: Mengirim token sebagai bukti login
                    'Authorization': `Bearer ${user.token.access_token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil riwayat.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error in getScanHistory:', error);
            throw error;
        }
    }
}

export default new HistoryService();