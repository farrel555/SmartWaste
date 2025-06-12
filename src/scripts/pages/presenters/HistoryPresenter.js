import HistoryService from '../../services/HistoryService';
import ScanHistoryItem from '../models/ScanHistoryItem'; // BARU: Impor model data

class HistoryPresenter {
    constructor(view) {
        this.view = view;
        this.view.presenter = this;
    }

    async init() {
        this.view.showLoading();
        try {
            // 1. Ambil data mentah dari service
            const historyData = await HistoryService.getScanHistory();
            
            // 2. DIUBAH: Ubah data mentah menjadi array dari instance model ScanHistoryItem
            // Ini membuat data menjadi lebih "pintar" dan terstruktur.
            const historyItems = historyData.map(item => new ScanHistoryItem(item));
            
            // 3. Render view dengan data yang sudah menjadi model
            this.view.render(historyItems);
            
        } catch (error) {
            // DIUBAH: Jika terjadi error, panggil metode showError di view
            // Ini memberikan umpan balik yang jelas kepada pengguna.
            this.view.showError('Gagal memuat riwayat. Silakan periksa koneksi Anda dan coba lagi.');
            console.error('Gagal memuat riwayat:', error);
        }
    }
}

export default HistoryPresenter;