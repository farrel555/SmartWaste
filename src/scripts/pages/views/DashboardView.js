// src/scripts/pages/views/DashboardView.js

import BaseView from './BaseView';
// DIUBAH: Impor fungsi initWasteBankMap dari file Leaflet yang baru
import { initWasteBankMap } from '../../utils/openMapsInitializer';

class DashboardView extends BaseView {
    constructor(containerId) {
        super(containerId);
    }

    render() {
        const chartData = [
            { name: 'Organik', percentage: 53, color: '#4CAF50' },
            { name: 'Anorganik', percentage: 40, color: '#FFC107' },
            { name: 'Residu', percentage: 6, color: '#9E9E9E' },
            { name: 'B3', percentage: 1, color: '#F44336' },
        ];

        const chartBarsHtml = chartData.map(item => `
            <div class="bar" style="height: ${item.percentage}%; background-color: ${item.color};">
                <div class="bar-content">
                    <span class="percentage">${item.percentage}%</span>
                    <span class="bar-name">${item.name}</span>
                </div>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="card dashboard-card">
                <div class="page-specific-header">
                    <div class="page-header-logo"><i class="fas fa-recycle"></i> SmartWaste</div>
                    <div class="page-header-title">Dashboard</div>
                </div>
                <h2>Tipe-Tipe Sampah</h2>
                <div class="waste-type-grid">
                    <div class="waste-type-item" data-type="organik">Organik</div>
                    <div class="waste-type-item" data-type="anorganik">Anorganik</div>
                    <div class="waste-type-item" data-type="b3">B3</div>
                    <div class="waste-type-item" data-type="residu">Residu</div>
                </div>
                <div id="explanation-container">
                    <div id="explanation-organik" class="explanation-panel hidden">
                        <h3>Sampah Organik</h3>
                        <p>Sampah organik adalah jenis sampah yang berasal dari sisa-sisa makhluk hidup dan mudah terurai (<em>degradable</em>) secara alami oleh mikroorganisme.</p>
                        <p><strong>Contoh:</strong> Sisa makanan, kulit buah, sayuran, daun kering, ranting pohon.</p>
                        <p><strong>Manfaat:</strong> Dapat diolah menjadi kompos untuk menyuburkan tanah.</p>
                    </div>
                    <div id="explanation-anorganik" class="explanation-panel hidden">
                        <h3>Sampah Anorganik</h3>
                        <p>Sampah anorganik adalah sampah yang sulit atau bahkan tidak bisa terurai secara alami. Sampah ini seringkali bisa didaur ulang.</p>
                        <p><strong>Contoh:</strong> Botol plastik, kaleng minuman, kertas, kaca, kemasan sachet.</p>
                        <p><strong>Manfaat:</strong> Dapat didaur ulang menjadi produk baru yang bernilai.</p>
                    </div>
                    <div id="explanation-b3" class="explanation-panel hidden">
                        <h3>Sampah B3 (Bahan Berbahaya dan Beracun)</h3>
                        <p>Sampah B3 adalah limbah yang mengandung zat atau bahan yang dapat membahayakan kesehatan atau lingkungan hidup, sehingga memerlukan penanganan khusus.</p>
                        <p><strong>Contoh:</strong> Baterai bekas, lampu neon (CFL), limbah elektronik, kaleng cat atau pestisida, obat-obatan kedaluwarsa, dan aki bekas.</p>
                        <p><strong>Penanganan:</strong> Harus dikumpulkan secara terpisah dan diserahkan ke fasilitas pengolahan limbah B3 resmi. Jangan dicampur dengan sampah lain atau dibakar.</p>
                    </div>
                    <div id="explanation-residu" class="explanation-panel hidden">
                        <h3>Sampah Residu</h3>
                        <p>Sampah residu adalah "sampah sisa" yang tidak dapat diolah atau didaur ulang kembali. Jenis sampah ini adalah yang terakhir berakhir di TPA (Tempat Pemrosesan Akhir).</p>
                        <p><strong>Contoh:</strong> Popok sekali pakai, pembalut, puntung rokok, styrofoam, kemasan plastik berlapis (sachet kopi/mi instan), dan sisa permen karet.</p>
                        <p><strong>Penanganan:</strong> Satu-satunya pilihan adalah membuangnya ke tempat sampah untuk diangkut ke TPA. Upaya utama harus difokuskan pada pengurangan (<em>reduce</em>) penggunaan produk yang menghasilkan sampah jenis ini.</p>
                    </div>
                </div>
                
                <h2>Cara Mengolah Sampah</h2>
                <div class="waste-handling-guide">
                    <div class="handling-item"><div class="handling-icon" style="background-color: #4CAF50;"><i class="fas fa-leaf"></i></div><div class="handling-text"><h4>Organik</h4><p>Olah menjadi kompos atau masukkan ke lubang biopori untuk menyuburkan tanah.</p></div></div>
                    <div class="handling-item"><div class="handling-icon" style="background-color: #FFC107;"><i class="fas fa-recycle"></i></div><div class="handling-text"><h4>Anorganik</h4><p>Bersihkan, pilah, dan setorkan ke bank sampah atau fasilitas daur ulang terdekat.</p></div></div>
                    <div class="handling-item"><div class="handling-icon" style="background-color: #F44336;"><i class="fas fa-exclamation-triangle"></i></div><div class="handling-text"><h4>B3 (Berbahaya & Beracun)</h4><p>Kumpulkan terpisah dalam wadah tertutup dan buang ke titik pengumpulan khusus B3.</p></div></div>
                    <div class="handling-item"><div class="handling-icon" style="background-color: #9E9E9E;"><i class="fas fa-trash-alt"></i></div><div class="handling-text"><h4>Residu</h4><p>Buang ke tempat sampah sebagai pilihan terakhir. Prioritaskan untuk mengurangi penggunaannya.</p></div></div>
                </div>
                <h2>Edukasi Pengelolaan Sampah</h2>
                <div class="education-chart-section">
                    <p>Berikut adalah visualisasi sederhana mengenai komposisi sampah dan titik edukasi:</p>
                    <div class="chart-placeholder">
                        <div class="bar-chart-container">
                            ${chartBarsHtml}
                        </div>
                        <p class="chart-description">Komposisi sampah nasional berdasarkan data KLHK (2023).</p>
                    </div>
                </div>
                
                <h2>Lokasi Bank Sampah Terdekat</h2>
                <div id="map-container" class="map-container">
                    <p style="text-align: center; padding: 20px;">Memuat peta...</p>
                </div>

                <h2>Anggota Kelompok</h2>
                <div class="team-members">
                   <div class="member-item"><i class="fas fa-user-circle"></i><span>Carlos Agunar Da Costa</span></div>
                   <div class="member-item"><i class="fas fa-user-circle"></i><span>Azmi Farrel</span></div>
                   <div class="member-item"><i class="fas fa-user-circle"></i><span>Sayyidina Ali</span></div>
                   <div class="member-item"><i class="fas fa-user-circle"></i><span>Arya Mulahernawan</span></div>
                </div>
            </div>
        `;
        
        this.bindEvents();
        this.loadMap();
    }

    async loadMap() {
        try {
            // Panggil fungsi initWasteBankMap dan berikan ID dari div wadah peta
            await initWasteBankMap('map-container');
            console.log("Peta Leaflet berhasil dimuat di DashboardView.");
        } catch (error) {
            console.error("Gagal memuat peta dari DashboardView:", error);
            // Pesan error sudah ditangani di dalam initWasteBankMap
        }
    }

    bindEvents() {
        this.bind('click', '.waste-type-item', (event) => {
            const clickedItem = event.target;
            const wasteType = clickedItem.dataset.type;
            const targetPanel = this.container.querySelector(`#explanation-${wasteType}`);
            if (!targetPanel) { return; }
            const isAlreadyOpen = !targetPanel.classList.contains('hidden');
            this.container.querySelectorAll('.explanation-panel').forEach(panel => {
                panel.classList.add('hidden');
            });
            if (!isAlreadyOpen) {
                targetPanel.classList.remove('hidden');
            }
        });
    }
}

export default DashboardView;