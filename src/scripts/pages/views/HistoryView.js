import BaseView from './BaseView';

class HistoryView extends BaseView {
    render(historyItems = []) {
        let itemsHtml = '<p>Belum ada riwayat scan.</p>';

        if (historyItems.length > 0) {
            itemsHtml = historyItems.map(item => `
                <div class="history-item">
                    <img src="${item.imageUrl}" alt="Hasil Scan" class="history-image">
                    <div class="history-info">
                        <p><strong>Jenis:</strong> ${item.wasteType}</p>
                        <p><strong>Tanggal:</strong> ${new Date(item.timestamp).toLocaleString('id-ID')}</p>
                    </div>
                </div>
            `).join('');
        }

        this.container.innerHTML = `
            <div class="card history-card">
                <div class="page-specific-header">
                    <div class="page-header-logo"><i class="fas fa-history"></i> Riwayat Scan</div>
                </div>
                <div class="history-list">${itemsHtml}</div>
            </div>
        `;
    }

    showLoading() {
        this.container.innerHTML = `<div class="card history-card"><p>Memuat riwayat...</p></div>`;
    }
}

export default HistoryView;