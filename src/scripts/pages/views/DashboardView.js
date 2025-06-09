// src/scripts/pages/views/DashboardView.js (Versi Perbaikan)

import BaseView from './BaseView';
// BARU: Impor fungsi inisialisasi peta yang sudah kita buat
import { initWasteBankMap } from '../../utils/googleMapsInitializer';

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
                    </div>
                <div id="explanation-container">
                    </div>
                
                <h2>Cara Mengolah Sampah</h2>
                <div class="waste-handling-guide">
                   </div>
                
                <h2>Edukasi Pengelolaan Sampah</h2>
                <div class="education-chart-section">
                    </div>
                
                <h2>Lokasi Bank Sampah Terdekat</h2>
                <div id="map-container" class="map-container">
                    <p style="text-align: center; padding: 20px;">Memuat peta...</p>
                </div>

                <h2>Anggota Kelompok</h2>
                <div class="team-members">
                   </div>
            </div>
        `;
        
        // Panggil event-event yang sudah ada
        this.bindEvents();
        
        // BARU: Panggil fungsi untuk memuat peta setelah HTML dirender
        this.loadMap();
    }

    /**
     * (BARU) Fungsi untuk memanggil inisialisasi peta secara asynchronous.
     */
    async loadMap() {
        try {
            // Panggil fungsi initWasteBankMap dan berikan ID dari div wadah peta
            await initWasteBankMap('map-container');
            console.log("Peta berhasil dimuat di DashboardView.");
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