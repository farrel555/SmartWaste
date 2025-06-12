// src/scripts/services/HistoryService.js (Final untuk FastAPI)

// Ganti dengan URL API dari Fly.io yang Anda dapatkan
const API_BASE_URL = 'https://smartwaste-api.fly.dev'; 

class HistoryService {
    async saveScanHistory(scanData) {
        try {
            // Kita tidak lagi mengirim timestamp, backend yang akan membuatnya
            const dataToSave = {
                imageUrl: scanData.imageUrl,
                wasteType: scanData.wasteType,
            };
            const response = await fetch(`${API_BASE_URL}/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        try {
            const response = await fetch(`${API_BASE_URL}/history`);
            if (!response.ok) throw new Error('Gagal mengambil riwayat dari API.');
            return await response.json();
        } catch (error) {
            console.error('Error in getScanHistory:', error);
            throw error;
        }
    }
}

export default new HistoryService();