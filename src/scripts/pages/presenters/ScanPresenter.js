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
            // Kita sudah di halaman #classification, jadi kita langsung proses
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // Simpan hasil ke riwayat
                try {
                    await HistoryService.saveScanHistory({
                        imageUrl: imageSrc,
                        wasteType: result.wasteType,
                        timestamp: new Date().toISOString(),
                    });
                    console.log('Riwayat scan berhasil disimpan.');
                } catch (saveError) {
                    console.error('Gagal menyimpan riwayat:', saveError);
                }

                // DIUBAH: Panggil navigateTo lagi, kali ini dengan membawa data
                // Ini akan memicu render ulang di ClassificationView dengan data yang benar
                this.appRouter.navigateTo('classification', imageSrc, result.wasteType);

            } else {
                throw new Error('Hasil klasifikasi tidak valid.');
            }
        } catch (error) {
            console.error('Error during classification:', error);
            this.classificationView.showError(error.message || 'Gagal mengklasifikasi gambar.');
        }
    }
}

export default ScanPresenter;