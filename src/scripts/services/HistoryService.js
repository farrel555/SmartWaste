// src/scripts/services/HistoryService.js (Versi Perbaikan dengan Header)

import AuthService from './AuthService';

class HistoryService {
    async saveScanHistory(scanData) {
        const user = AuthService.getCurrentUser();
        
        // Pengecekan tambahan: pastikan user dan token ada
        if (!user || !user.token || !user.token.access_token) {
            return Promise.reject(new Error('Pengguna tidak valid atau token tidak ditemukan.'));
        }

        try {
            const response = await fetch('/.netlify/functions/save-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // INI BAGIAN PALING PENTING: Mengirim token sebagai bukti login
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
            return Promise.reject(new Error('Pengguna tidak terautentikasi.'));
        }
        
        try {
            const response = await fetch('/.netlify/functions/get-history', {
                headers: {
                    // INI BAGIAN PALING PENTING: Mengirim token sebagai bukti login
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