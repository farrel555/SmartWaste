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

    // Metode ini dipanggil oleh AppRouter saat rute #scan diakses
    init() {
        // Daftarkan handler di view. Saat view menerima file, ia akan memanggil 'handleFileSelected'
        this.scanView.setFileHandler(this.handleFileSelected.bind(this));
        this.scanView.render();
    }

    /**
     * Metode ini dipanggil oleh ScanView saat pengguna memilih file.
     * @param {File} file - Objek file gambar yang dipilih pengguna.
     */
    handleFileSelected(file) {
        // Tampilkan halaman loading SEGERA setelah file dipilih
        this.classificationView.showLoading();
        // Arahkan ke halaman #classification agar URL berubah dan pengguna melihat status loading
        this.appRouter.navigateTo('classification');

        const reader = new FileReader();

        // Saat FileReader selesai membaca file
        reader.onload = (event) => {
            const imageSrc = event.target.result; // Ini adalah data base64 dari gambar
            console.log('File berhasil dibaca, memulai klasifikasi...');
            // Panggil metode klasifikasi dengan data gambar
            this.classifyAndRecommend(imageSrc); 
        };

        // Saat terjadi error saat membaca file
        reader.onerror = (error) => {
            console.error("Error membaca file:", error);
            // Tampilkan error di halaman klasifikasi
            this.classificationView.showError("Gagal memuat file gambar. Silakan coba lagi.");
        };

        // Mulai proses pembacaan file
        reader.readAsDataURL(file);
    }

    async classifyAndRecommend(imageSrc) {
        try {
            // Kita sudah berada di halaman #classification yang menampilkan loading.
            // Sekarang kita langsung proses gambarnya.
            
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

                // DIUBAH: Render ulang halaman klasifikasi dengan data hasilnya.
                // Kita tidak perlu navigateTo() lagi, cukup panggil render dari view yang sudah ada.
                this.classificationView.render(imageSrc, result.wasteType);

            } else {
                throw new Error('Hasil klasifikasi tidak valid.');
            }
        } catch (error) {
            console.error('Error during classification:', error);
            // Gunakan pesan error yang lebih spesifik jika ada
            this.classificationView.showError(error.message || 'Gagal mengklasifikasi gambar. Silakan coba lagi.');
        }
    }
}

export default ScanPresenter;