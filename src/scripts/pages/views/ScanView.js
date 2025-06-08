// src/scripts/pages/views/ScanView.js (Versi Perbaikan)

import BaseView from './BaseView';

class ScanView extends BaseView {
    constructor(containerId) {
        super(containerId);
        // Handler akan di-set oleh presenter
        this.fileHandler = null; 
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
                    <p>Unggah Gambar dari Galeri</p>
                </div>
                
                <input type="file" id="file-input" accept="image/*" style="display: none;">
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        const fileInput = this.container.querySelector('#file-input');

        // Saat opsi "Gunakan Kamera" diklik
        this.bind('click', '#camera-option', () => {
            // Atribut 'capture' akan memberitahu browser untuk membuka kamera
            fileInput.setAttribute('capture', 'environment');
            fileInput.click(); // Memicu klik pada input file
        });

        // Saat opsi "Unggah Gambar" diklik
        this.bind('click', '#upload-option', () => {
            // Hapus atribut 'capture' agar browser membuka galeri file
            fileInput.removeAttribute('capture');
            fileInput.click(); // Memicu klik pada input file
        });

        // Saat pengguna telah memilih file (baik dari kamera maupun galeri)
        this.bind('change', '#file-input', (event) => {
            if (this.fileHandler && event.target.files && event.target.files.length > 0) {
                const file = event.target.files[0];
                this.fileHandler(file); // Kirim file ke presenter untuk diproses
            }
        });
    }

    // Metode untuk presenter agar bisa 'mendengarkan' event dari view ini
    setFileHandler(handler) {
        this.fileHandler = handler;
    }
}

export default ScanView;