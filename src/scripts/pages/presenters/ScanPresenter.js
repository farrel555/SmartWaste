// src/scripts/pages/presenters/ScanPresenter.js

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
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageSrc = event.target.result;
            this.classifyAndRecommend(imageSrc); 
        };
        reader.onerror = () => {
            this.classificationView.showError("Gagal memuat file gambar.");
        };
        reader.readAsDataURL(file);
    }

    async classifyAndRecommend(imageSrc) {
        try {
            // 1. Tampilkan loading dan navigasi ke halaman klasifikasi
            this.classificationView.showLoading();
            this.appRouter.navigateTo('classification');

            // 2. Jalankan klasifikasi
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // 3. Simpan riwayat
                try {
                    await HistoryService.saveScanHistory({
                        imageUrl: imageSrc,
                        wasteType: result.wasteType,
                        timestamp: new Date().toISOString(),
                    });
                } catch (saveError) {
                    console.error('Gagal menyimpan riwayat:', saveError);
                }

                // 4. PANGGILAN KUNCI: Navigasi lagi dengan membawa data hasil
                this.appRouter.navigateTo('classification', imageSrc, result.wasteType);

            } else {
                throw new Error('Hasil klasifikasi tidak valid dari API.');
            }
        } catch (error) {
            this.classificationView.showError(error.message || 'Gagal mengklasifikasi gambar.');
        }
    }
}

export default ScanPresenter;