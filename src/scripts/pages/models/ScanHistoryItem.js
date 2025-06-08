/**
 * Model ScanHistoryItem
 * Merepresentasikan satu item dalam daftar riwayat scan.
 */
class ScanHistoryItem {
    constructor({ imageUrl, wasteType, timestamp }) {
        this.imageUrl = imageUrl;
        this.wasteType = wasteType;
        this.timestamp = new Date(timestamp); // Ubah string timestamp menjadi objek Date
    }

    /**
     * Contoh metode helper untuk memformat tanggal agar mudah dibaca.
     * @returns {string} Tanggal yang sudah diformat (misal: "8 Juni 2025, 12.30")
     */
    getFormattedDate() {
        return this.timestamp.toLocaleString('id-ID', {
            dateStyle: 'long',
            timeStyle: 'short',
        });
    }
}

export default ScanHistoryItem;