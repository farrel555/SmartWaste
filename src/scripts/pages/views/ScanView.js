// src/scripts/pages/views/ScanView.js

import BaseView from './BaseView';

class ScanView extends BaseView {
    constructor(containerId) {
        super(containerId);
        this.cameraHandler = null;
        this.uploadHandler = null;
    }

    render() {
        this.container.innerHTML = `
            <div class="card scan-card">
                <div class="page-specific-header">
                    <div class="page-header-logo"><i class="fas fa-recycle"></i> SmartWaste</div>
                    <div class="page-header-title">Scan Sampah</div>
                </div>

                <h2>Pilih gambar sampah untuk di-scan</h2>
                <div class="scan-option" id="camera-option">
                    <i class="fas fa-camera"></i>
                    <p>Gunakan Kamera</p>
                </div>
                <div class="scan-option" id="upload-option">
                    <i class="fas fa-upload"></i>
                    <p>Unggah Gambar Sampah</p>
                    <input type="file" id="upload-input" accept="image/*" style="display: none;">
                </div>
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        this.bind('click', '#camera-option', () => {
            if (this.cameraHandler) {
                this.cameraHandler();
            }
        });

        this.bind('click', '#upload-option', () => {
            this.container.querySelector('#upload-input').click();
        });

        this.bind('change', '#upload-input', (event) => {
            if (this.uploadHandler && event.target.files.length > 0) {
                this.uploadHandler(event.target.files[0]);
            }
        });
    }

    setCameraHandler(handler) {
        this.cameraHandler = handler;
    }

    setUploadHandler(handler) {
        this.uploadHandler = handler;
    }

    showMessage(message, type = 'success') {
        // Implementasi untuk menampilkan pesan (misal, di bawah form)
        console.log(`ScanView Message (${type}): ${message}`);
        // Anda mungkin ingin menambahkan elemen pesan di sini juga
    }
}

export default ScanView;