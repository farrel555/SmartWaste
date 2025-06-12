// src/scripts/services/HistoryService.js

import AuthService from './AuthService';

const API_BASE_URL = 'https://smartwaste-api.fly.dev'; 

class HistoryService {
    async saveScanHistory(scanData) {
        const user = AuthService.getCurrentUser();
        if (!user || !user.token?.access_token) {
            return Promise.reject(new Error('Pengguna tidak valid atau token tidak ditemukan.'));
        }

        try {
            const dataToSave = {
                imageUrl: scanData.imageUrl,
                wasteType: scanData.wasteType,
            };
            const response = await fetch(`${API_BASE_URL}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // PASTIKAN HEADER INI ADA
                    'Authorization': `Bearer ${user.token.access_token}`
                },
                body: JSON.stringify(dataToSave),
            });
            if (!response.ok) throw new Error('Gagal menyimpan riwayat ke API.');
            return await response.json();
        } catch (error) {
            console.error('Error in saveScanHistory:', error);
            throw error;
        }
    }

    async getScanHistory() {
        const user = AuthService.getCurrentUser();
        if (!user || !user.token?.access_token) {
            return Promise.reject(new Error('Pengguna tidak terautentikasi.'));
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/history`, {
                method: 'GET',
                headers: {
                    // PASTIKAN HEADER INI ADA
                    'Authorization': `Bearer ${user.token.access_token}`
                }
            });
            if (!response.ok) throw new Error('Gagal mengambil riwayat dari API.');
            return await response.json();
        } catch (error) {
            console.error('Error in getScanHistory:', error);
            throw error;
        }
    }
}

export default new HistoryService();