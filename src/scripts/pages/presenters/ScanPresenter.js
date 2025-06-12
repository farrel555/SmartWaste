// src/scripts/pages/presenters/ScanPresenter.js

// DIHAPUS: HistoryService tidak lagi diperlukan di sini
// import HistoryService from '../../services/HistoryService';

// HANYA ClassificationService yang kita butuhkan
import ClassificationService from '../../services/ClassificationService';

class ScanPresenter {
    constructor(scanView, classificationView, recommendationView, appRouter) {
        this.scanView = scanView;
        this.classificationView = classificationView;
        this.recommendationView = recommendationView;
        this.appRouter = appRouter;
        this.scanView.presenter = this;
        this.classificationView.presenter = this;
    }

    init() {
        this.scanView.setFileHandler(this.handleFileSelected.bind(this));
        this.scanView.render();
    }

    handleFileSelected(file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            const imageSrc = event.target.result;
            // Langsung panggil metode klasifikasi dan tampilkan hasilnya
            this.classifyAndShowResult(imageSrc); 
        };

        reader.onerror = () => {
            this.classificationView.showError("Gagal memuat file gambar.");
        };

        reader.readAsDataURL(file);
    }

    async classifyAndShowResult(imageSrc) {
        try {
            // 1. Tampilkan halaman loading terlebih dahulu
            this.classificationView.showLoading();
            this.appRouter.navigateTo('classification');

            // 2. Kirim gambar ke backend FastAPI untuk diprediksi
            const result = await ClassificationService.classifyImage(imageSrc);

            if (result && result.wasteType) {
                // Backend FastAPI sekarang juga bisa kita program untuk
                // otomatis menyimpan riwayat setelah prediksi berhasil.
                // Jadi, frontend tidak perlu lagi memanggil saveHistory secara terpisah.
                console.log('Klasifikasi berhasil dan riwayat otomatis disimpan di backend.');

                // 3. Tampilkan hasil klasifikasi di view
                this.classificationView.render(imageSrc, result.wasteType);

            } else {
                throw new Error('Hasil klasifikasi tidak valid dari API.');
            }
        } catch (error) {
            console.error('Error during classification:', error);
            this.classificationView.showError(error.message || 'Gagal mengklasifikasi gambar.');
        }
    }
}

export default ScanPresenter;