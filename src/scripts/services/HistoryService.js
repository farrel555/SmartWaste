// src/scripts/services/HistoryService.js

// URL API Anda, sama dengan yang digunakan untuk klasifikasi
const API_BASE_URL = 'https://smartwaste-api.fly.dev'; 

class HistoryService {
    async saveScanHistory(scanData) {
        try {
            const response = await fetch(`${API_BASE_URL}/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scanData),
            });
            if (!response.ok) throw new Error('Gagal menyimpan riwayat.');
            return await response.json();
        } catch (error) {
            console.error('Error in saveScanHistory:', error);
            throw error;
        }
    }

    async getScanHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/history`);
            if (!response.ok) throw new Error('Gagal mengambil riwayat.');
            return await response.json();
        } catch (error) {
            console.error('Error in getScanHistory:', error);
            throw error;
        }
    }
}

export default new HistoryService();