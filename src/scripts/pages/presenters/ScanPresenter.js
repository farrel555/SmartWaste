// src/scripts/pages/presenters/ScanPresenter.js

import DataService from '../models/DataService'; // Untuk klasifikasi gambar
import ScanView from '../views/ScanView';
import ClassificationView from '../views/ClassificationView';
import RecommendationView from '../views/RecommendationView';

class ScanPresenter {
    constructor(scanView, classificationView, recommendationView, dataService, appRouter) {
        this.scanView = scanView;
        this.classificationView = classificationView;
        this.recommendationView = recommendationView;
        this.dataService = dataService;
        this.appRouter = appRouter; // Untuk navigasi lanjutan

        this.capturedImage = null; // Untuk menyimpan data gambar yang ditangkap/diunggah

        this.scanView.setCameraHandler(this.handleCameraCapture.bind(this));
        this.scanView.setUploadHandler(this.handleImageUpload.bind(this));
        this.recommendationView.setContinueHandler(this.handleRecommendationContinue.bind(this));
        this.recommendationView.setCloseHandler(this.handleRecommendationClose.bind(this));
    }

    init() {
        this.scanView.render();
    }

    async handleCameraCapture() {
        console.log("Menggunakan kamera...");
        // Implementasi nyata akan melibatkan API kamera (getUserMedia)
        // Untuk demo: simulasi pengambilan gambar
        this.scanView.showMessage('Mengambil gambar dari kamera (simulasi)...', 'info');
        // Untuk demo, kita akan langsung memicu klasifikasi dengan dummy image data
        const dummyImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='; // Contoh data gambar transparan
        this.capturedImage = dummyImageData;
        this.classifyAndRecommend(dummyImageData);
    }

    async handleImageUpload(file) {
        console.log("Mengunggah gambar...", file);
        if (!file) {
            this.scanView.showMessage('Tidak ada file yang dipilih.', 'error');
            return;
        }

        this.scanView.showMessage('Mengunggah gambar...', 'info');

        // Membaca file gambar sebagai Data URL
        const reader = new FileReader();
        reader.onload = async (e) => {
            this.capturedImage = e.target.result; // Simpan Data URL
            this.classifyAndRecommend(this.capturedImage);
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            this.scanView.showMessage('Gagal membaca file gambar.', 'error');
        };
        reader.readAsDataURL(file);
    }

    async classifyAndRecommend(imageData) {
        this.scanView.showMessage('Menganalisis gambar sampah...', 'info');
        try {
            const classificationResult = await this.dataService.classifyImage(imageData); // Panggil metode dummy di DataService

            this.scanView.showMessage(`Sampah diklasifikasikan sebagai: ${classificationResult.type}`, 'success');

            // Tampilkan hasil klasifikasi
            this.appRouter.navigateTo('classification', imageData, classificationResult.type);

            // Tampilkan pop-up rekomendasi setelah klasifikasi
            setTimeout(() => { // Beri sedikit waktu agar halaman klasifikasi terlihat
                this.recommendationView.render(classificationResult.recommendation);
                this.recommendationView.container.classList.add('pop-up-open'); // Tambahkan kelas untuk pop-up
                // Simpan state untuk navigasi lanjutan
                this.lastRecommendationCanBeCrafted = classificationResult.canBeCrafted;
            }, 1000);

        } catch (error) {
            console.error("Error during classification:", error);
            this.scanView.showMessage('Gagal mengklasifikasikan sampah.', 'error');
        }
    }

    handleRecommendationContinue() {
        this.recommendationView.container.classList.remove('pop-up-open'); // Tutup pop-up
        if (this.lastRecommendationCanBeCrafted) {
            // Arahkan ke halaman ide kerajinan jika direkomendasikan
            this.appRouter.navigateTo('recommendation', "Ide kerajinan dari sampah yang terklasifikasi.");
        } else {
            // Jika tidak ada rekomendasi kerajinan, kembali ke halaman scan atau dashboard
            this.appRouter.navigateTo('dashboard'); // Kembali ke dashboard
        }
        this.lastRecommendationCanBeCrafted = false; // Reset flag
    }

    handleRecommendationClose() {
        this.recommendationView.container.classList.remove('pop-up-open'); // Tutup pop-up
        this.appRouter.navigateTo('scan'); // Kembali ke halaman scan
    }
}

export default ScanPresenter;