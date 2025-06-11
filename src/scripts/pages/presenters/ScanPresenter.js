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
        // Tampilkan halaman loading SEGERA setelah file dipilih.
        // Panggilan ini akan menampilkan "Menganalisis gambar..." di UI.
        this.classificationView.showLoading();
        
        // Panggil metode untuk memulai proses klasifikasi.
        // Kita tidak perlu navigasi di sini karena `classifyAndRecommend` akan menanganinya.
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
            // Karena kita sudah menampilkan loading, sekarang kita arahkan pengguna
            // ke halaman klasifikasi agar URL di browser update.
            this.appRouter.navigateTo('classification');

            // Jalankan proses klasifikasi yang mungkin memakan waktu.
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // Simpan hasil ke riwayat (jika berhasil).
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

                // BARIS YANG DIPERBAIKI:
                // Panggil navigateTo lagi, kali ini dengan membawa data lengkap.
                // Ini akan memicu AppRouter untuk me-render ClassificationView
                // dengan data yang benar, menggantikan tampilan loading.
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