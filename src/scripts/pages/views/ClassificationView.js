// src/scripts/pages/views/ClassificationView.js
import BaseView from './BaseView';

class ClassificationView extends BaseView {
    constructor(containerId) {
        super(containerId);
    }

    render(imageSrc, wasteType) {
        this.container.innerHTML = `
            <div class="card classification-card">
                <div class="app-header">
                    <div class="logo-text"><i class="fas fa-recycle"></i> SmartWaste</div>
                    <div>Klasifikasi Sampah</div>
                </div>
                <div class="classification-result">
                    <img src="${imageSrc}" alt="Gambar Sampah" width="200">
                    <p>Tipe Sampah</p>
                    <h2 class="waste-type-display">${wasteType}</h2>
                </div>
            </div>
        `;
    }
}

export default ClassificationView;