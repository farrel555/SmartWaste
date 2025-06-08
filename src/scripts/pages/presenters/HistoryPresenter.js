import HistoryService from '../../services/HistoryService';

class HistoryPresenter {
    constructor(view) {
        this.view = view;
        this.view.presenter = this;
    }

    async init() {
        this.view.showLoading();
        try {
            const historyData = await HistoryService.getScanHistory();
            this.view.render(historyData);
        } catch (error) {
            this.view.render([]); // Tampilkan halaman kosong jika error
            console.error('Gagal memuat riwayat:', error);
        }
    }
}

export default HistoryPresenter;