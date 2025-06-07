// src/scripts/pages/views/AuthView.js

import BaseView from './BaseView';

class AuthView extends BaseView {
    constructor(containerId) {
        super(containerId);
    }

    render() {
        this.container.innerHTML = `
            <div class="card auth-card">
                <h2>Selamat Datang!</h2>
                <p>Silakan masuk atau daftar untuk mengakses semua fitur pengelolaan sampah cerdas.</p>
                <div class="auth-action">
                    <button class="btn" id="auth-action-btn">
                        <i class="fas fa-sign-in-alt"></i> Masuk / Daftar
                    </button>
                </div>
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        this.bind('click', '#auth-action-btn', () => {
            if (this.presenter && this.presenter.handleAuthAction) {
                // Beritahu presenter untuk menampilkan widget
                this.presenter.handleAuthAction();
            }
        });
    }
}

export default AuthView;