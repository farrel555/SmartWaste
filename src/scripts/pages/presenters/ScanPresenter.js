// src/scripts/pages/presenters/ScanPresenter.js (Versi Perbaikan Final)

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

    /**
     * Metode ini sekarang HANYA membaca file dan memulai proses klasifikasi.
     * Tidak ada lagi navigasi di sini.
     */
    handleFileSelected(file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            const imageSrc = event.target.result;
            console.log('File berhasil dibaca, memulai klasifikasi...');
            // Langsung panggil metode klasifikasi dengan data gambar
            this.classifyAndRecommend(imageSrc); 
        };

        reader.onerror = (error) => {
            console.error("Error membaca file:", error);
            // Jika file gagal dibaca, kita bisa tampilkan error langsung
            // atau arahkan ke halaman error. Untuk saat ini, kita log saja.
        };

        reader.readAsDataURL(file);
    }

    /**
     * Metode ini sekarang bertanggung jawab penuh atas alur dari loading hingga hasil.
     */
    async classifyAndRecommend(imageSrc) {
        try {
            // 1. Tampilkan halaman loading SEKARANG, sebelum proses berat dimulai.
            this.classificationView.showLoading();
            // 2. Arahkan ke halaman klasifikasi agar pengguna melihat status loading.
            this.appRouter.navigateTo('classification');

            // 3. Jalankan proses klasifikasi yang mungkin memakan waktu.
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // 4. Simpan hasil ke riwayat (jika berhasil).
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

                // 5. Render ulang halaman klasifikasi, kali ini dengan data hasilnya.
                // Ini akan menggantikan tampilan "loading" dengan hasil akhir.
                this.classificationView.render(imageSrc, result.wasteType);

            } else {
                throw new Error('Hasil klasifikasi tidak valid.');
            }
        } catch (error) {
            console.error('Error during classification:', error);
            // Jika terjadi error, tampilkan halaman error.
            this.classificationView.showError(error.message || 'Gagal mengklasifikasi gambar.');
        }
    }
}

export default ScanPresenter;