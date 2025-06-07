// src/scripts/pages/views/RecommendationView.js
import BaseView from './BaseView';

class RecommendationView extends BaseView {
    constructor(containerId) {
        super(containerId);
        this.continueHandler = null;
        this.closeHandler = null;
    }

    render(recommendationText) {
        this.container.innerHTML = `
            <div class="card recommendation-card">
                <div class="app-header">
                    <div class="logo-text"><i class="fas fa-recycle"></i> SmartWaste</div>
                    <div>Rekomendasi Ide Kerajinan</div>
                </div>
                <h2>Rekomendasi:</h2>
                <p>${recommendationText}</p>
                <div class="button-group">
                    <button class="btn" id="continue-btn">Lanjutkan</button>
                    <button class="btn btn-secondary" id="close-btn">Tutup</button>
                </div>
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        this.bind('click', '#continue-btn', () => {
            if (this.continueHandler) {
                this.continueHandler();
            }
        });

        this.bind('click', '#close-btn', () => {
            if (this.closeHandler) {
                this.closeHandler();
            }
        });
    }

    setContinueHandler(handler) {
        this.continueHandler = handler;
    }

    setCloseHandler(handler) {
        this.closeHandler = handler;
    }
}

export default RecommendationView;