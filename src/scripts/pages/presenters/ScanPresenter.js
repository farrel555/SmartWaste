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
        // Arahkan ke halaman klasifikasi agar pengguna melihat status loading
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
            // Kita sudah menampilkan loading dan navigasi di handleFileSelected,
            // jadi kita bisa langsung melakukan klasifikasi.
            
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

                // Render ulang halaman klasifikasi, kali ini dengan data hasilnya
                // Kita tidak menggunakan navigateTo lagi untuk menghindari refresh halaman
                this.classificationView.render(imageSrc, result.wasteType);
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