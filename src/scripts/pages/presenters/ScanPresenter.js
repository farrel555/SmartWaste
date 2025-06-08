// src/scripts/pages/presenters/ScanPresenter.js (Versi Perbaikan)

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
            console.log('File berhasil dibaca, memulai klasifikasi...');
            this.classifyAndRecommend(imageSrc); 
        };

        reader.onerror = (error) => {
            console.error("Error membaca file:", error);
            // Anda mungkin ingin menampilkan pesan error di ScanView di sini
        };

        reader.readAsDataURL(file);
    }

    async classifyAndRecommend(imageSrc) {
        try {
            // Tampilkan loading di halaman klasifikasi sementara proses berjalan
            this.classificationView.showLoading();
            
            // DIHAPUS: Panggilan navigateTo('classification') yang pertama dihapus dari sini
            // untuk mencegah navigasi ganda.

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

                // Arahkan ke halaman klasifikasi HANYA SEKALI di sini, dengan membawa data hasilnya
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