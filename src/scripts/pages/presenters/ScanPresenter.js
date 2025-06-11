// src/scripts/pages/presenters/ScanPresenter.js (Versi Final)

import ClassificationService from '../../services/ClassificationService';
import HistoryService from '../../services/HistoryService';

class ScanPresenter {
    constructor(scanView, classificationView, recommendationView, appRouter) {
        this.scanView = scanView;
        this.classificationView = classificationView;
        this.recommendationView = recommendationView;
        this.appRouter = appRouter;
        
        this.scanView.presenter = this;
    }

    init() {
        this.scanView.setFileHandler(this.handleFileSelected.bind(this));
        this.scanView.render();
    }

    handleFileSelected(file) {
        // Tampilkan halaman loading SEGERA setelah file dipilih
        this.classificationView.showLoading();
        // Arahkan ke halaman #classification agar URL berubah dan pengguna melihat status loading
        this.appRouter.navigateTo('classification');

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageSrc = event.target.result;
            this.classifyAndRecommend(imageSrc); 
        };
        reader.onerror = (error) => {
            console.error("Error membaca file:", error);
            this.classificationView.showError("Gagal memuat file gambar. Silakan coba lagi.");
        };
        reader.readAsDataURL(file);
    }

    async classifyAndRecommend(imageSrc) {
        try {
            this.classificationView.showLoading();
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // ... (logika penyimpanan riwayat tidak berubah) ...

                // DIUBAH: Panggil navigateTo lagi dengan membawa data
                this.appRouter.navigateTo('classification', imageSrc, result.wasteType);
            } else {
                throw new Error('Hasil klasifikasi tidak valid.');
            }
        } catch (error) {
            console.error('Error during classification:', error);
            this.classificationView.showError('Gagal mengklasifikasi gambar. Silakan coba lagi.');
        }
    }
}

export default ScanPresenter;