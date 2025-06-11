// src/scripts/pages/views/ClassificationView.js

import BaseView from './BaseView';

class ClassificationView extends BaseView {
    constructor(containerId) {
        super(containerId);
    }

    render(imageSrc, wasteType) {
        // Pengecekan Pengaman: Jika dipanggil tanpa data, jangan lakukan apa-apa.
        // Tampilan loading/error akan tetap ada.
        if (!imageSrc || !wasteType) {
            console.warn("ClassificationView.render dipanggil tanpa data lengkap.");
            return; 
        }

        let recommendationText = 'Informasi lebih lanjut tidak tersedia.';
        // Gunakan .toLowerCase() dengan aman di sini
        switch (wasteType.toLowerCase()) {
            case 'organik':
                recommendationText = 'Sampah ini dapat diolah menjadi kompos atau pakan ternak.';
                break;
            case 'non_organik':
                recommendationText = 'Dapat didaur ulang. Pisahkan dan setorkan ke bank sampah.';
                break;
            case 'b3':
                recommendationText = 'Berbahaya! Buang ke fasilitas penampungan limbah B3 khusus.';
                break;
            case 'residu':
                recommendationText = 'Buang ke tempat sampah sebagai pilihan terakhir.';
                break;
        }

        this.container.innerHTML = `
            <div class="card classification-card">
                <div class="page-specific-header">
                    <div class="page-header-logo"><i class="fas fa-check-circle"></i> Hasil Klasifikasi</div>
                </div>
                <h2>Hasil Scan Ditemukan</h2>
                <div class="classification-result">
                    <img src="${imageSrc}" alt="Gambar yang di-scan">
                    <p>Jenis Sampah: <strong>${wasteType.charAt(0).toUpperCase() + wasteType.slice(1)}</strong></p>
                    <p class="recommendation-text">${recommendationText}</p>
                </div>
                <button class="btn" id="scan-again-btn">Scan Lagi</button>
            </div>
        `;
        this.bindEvents();
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="card classification-card">
                <div class="page-specific-header">
                    <div class="page-header-logo"><i class="fas fa-spinner fa-spin"></i> Menganalisis</div>
                </div>
                <h2>Menganalisis Gambar...</h2>
                <p>Harap tunggu, sistem kami sedang mengidentifikasi jenis sampah.</p>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="card classification-card error-card">
                 <div class="page-specific-header">
                    <div class="page-header-logo"><i class="fas fa-exclamation-triangle"></i> Terjadi Error</div>
                </div>
                <h2>Oops! Terjadi Kesalahan</h2>
                <p>${message}</p>
                <button class="btn" id="scan-again-btn">Coba Scan Lagi</button>
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        const scanAgainButton = this.container.querySelector('#scan-again-btn');
        // Pastikan presenter dan appRouter ada sebelum mengikat event
        if (scanAgainButton && this.presenter && this.presenter.appRouter) {
             this.bind('click', '#scan-again-btn', () => {
                this.presenter.appRouter.navigateTo('scan');
            });
        }
    }
}

export default ClassificationView;