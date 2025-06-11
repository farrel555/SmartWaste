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

    handleFileSelected(file) {
        // 1. Arahkan ke halaman klasifikasi. Karena tidak ada argumen, 
        //    AppRouter akan memanggil classificationView.showLoading()
        this.appRouter.navigateTo('classification');

        // 2. Baca file secara asynchronous
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageSrc = event.target.result;
            // 3. Setelah file siap, panggil proses klasifikasi
            this.classifyAndRecommend(imageSrc); 
        };
        reader.onerror = () => {
            this.classificationView.showError("Gagal memuat file gambar.");
        };
        reader.readAsDataURL(file);
    }

    async classifyAndRecommend(imageSrc) {
        try {
            // Kita sudah berada di halaman #classification yang menampilkan loading.
            
            // 4. Lakukan proses klasifikasi
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // 5. Simpan riwayat
                try {
                    await HistoryService.saveScanHistory({
                        imageUrl: imageSrc,
                        wasteType: result.wasteType,
                        timestamp: new Date().toISOString(),
                    });
                } catch (saveError) {
                    console.error('Gagal menyimpan riwayat:', saveError);
                }

                // 6. PANGGILAN KUNCI: Render ulang ClassificationView dengan data hasil
                // Kali ini, karena kita tidak memanggil navigateTo, URL tidak akan berubah,
                // hanya kontennya yang akan diperbarui.
                this.classificationView.render(imageSrc, result.wasteType);

            } else {
                throw new Error('Hasil klasifikasi tidak valid dari API.');
            }
        } catch (error) {
            // 7. Jika terjadi error, tampilkan pesan error
            this.classificationView.showError(error.message || 'Gagal mengklasifikasi gambar.');
        }
    }
}

export default ScanPresenter;