// src/scripts/pages/presenters/ScanPresenter.js

import ClassificationService from '../../services/ClassificationService';
import HistoryService from '../../services/HistoryService'; 
class ScanPresenter {
    constructor(scanView, classificationView, recommendationView, appRouter) {
        this.scanView = scanView;
        this.classificationView = classificationView;
        this.recommendationView = recommendationView;
        this.appRouter = appRouter;
        
        // Hubungkan view dengan presenter ini
        this.scanView.presenter = this;
    }

    init() {
        this.scanView.render();
    }

    async classifyAndRecommend(imageSrc) {
        try {
            this.classificationView.showLoading();
            
            // 1. Lakukan klasifikasi seperti biasa
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // 2. BARU: Simpan hasil ke riwayat
                try {
                    await HistoryService.saveScanHistory({
                        // Ganti imageSrc dengan URL gambar setelah di-upload jika ada
                        imageUrl: imageSrc, 
                        wasteType: result.wasteType,
                        timestamp: new Date().toISOString(),
                    });
                    console.log('Riwayat scan berhasil disimpan.');
                } catch (saveError) {
                    // Jika gagal menyimpan, jangan hentikan alur utama. Cukup log error.
                    console.error('Gagal menyimpan riwayat:', saveError);
                    // Anda bisa menambahkan notifikasi kecil di UI jika perlu
                }

                // 3. Lanjutkan ke halaman klasifikasi seperti biasa
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