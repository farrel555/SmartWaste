// src/scripts/services/HistoryService.js

const API_BASE_URL = 'https://smartwaste-api.fly.dev'; // Ganti jika perlu

class HistoryService {
    async saveScanHistory(scanData) {
        try {
            // DIUBAH: Kirim objek tanpa timestamp
            const dataToSave = {
                imageUrl: scanData.imageUrl,
                wasteType: scanData.wasteType,
            };

            const response = await fetch(`${API_BASE_URL}/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
            });
            // ... sisa kode tidak berubah
        } catch (error) {
            // ...
        }
    }
    // ... metode getScanHistory tidak berubah
}