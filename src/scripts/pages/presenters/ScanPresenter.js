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
        // 1. Tampilkan halaman loading SEGERA setelah file dipilih
        this.classificationView.showLoading();
        // 2. Arahkan ke halaman #classification agar URL berubah dan pengguna melihat status loading
        this.appRouter.navigateTo('classification');

        const reader = new FileReader();

        // 3. Saat FileReader selesai membaca file, baru mulai klasifikasi
        reader.onload = (event) => {
            const imageSrc = event.target.result; // Ini adalah data base64 dari gambar
            console.log('File berhasil dibaca, memulai klasifikasi...');
            // Panggil metode klasifikasi dengan data gambar
            this.classifyAndRecommend(imageSrc); 
        };

        // Jika terjadi error saat membaca file itu sendiri
        reader.onerror = (error) => {
            console.error("Error membaca file:", error);
            this.classificationView.showError("Gagal memuat file gambar. Silakan coba lagi.");
        };

        // Mulai proses pembacaan file
        reader.readAsDataURL(file);
    }

    async classifyAndRecommend(imageSrc) {
        try {
            // Kita sudah berada di halaman #classification yang menampilkan loading.
            // Sekarang kita langsung panggil API backend.
            
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // Simpan hasil ke riwayat (jika berhasil)
                try {
                    await HistoryService.saveScanHistory({
                        imageUrl: imageSrc,
                        wasteType: result.wasteType,
                        timestamp: new Date().toISOString(),
                    });
                    console.log('Riwayat scan berhasil disimpan.');
                } catch (saveError) {
                    // Jika gagal menyimpan riwayat, jangan hentikan alur. Cukup log error.
                    console.error('Gagal menyimpan riwayat:', saveError);
                }

                // Render ulang halaman klasifikasi, kali ini dengan data hasilnya.
                // Kita tidak menggunakan navigateTo() lagi untuk menghindari refresh halaman.
                this.classificationView.render(imageSrc, result.wasteType);

            } else {
                // Jika API mengembalikan data tanpa 'wasteType'
                throw new Error('Respons dari API tidak valid.');
            }
        } catch (error) {
            console.error('Error during classification:', error);
            // Tampilkan pesan error yang lebih spesifik kepada pengguna
            this.classificationView.showError(error.message || 'Gagal mengklasifikasi gambar. Silakan coba lagi.');
        }
    }
}

export default ScanPresenter;