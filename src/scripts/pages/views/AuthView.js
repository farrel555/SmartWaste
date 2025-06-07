// src/scripts/pages/views/AuthView.js

import BaseView from './BaseView';

class AuthView extends BaseView {
    constructor(containerId) {
        super(containerId);
        // Handler tidak lagi diperlukan di sini
    }

    render() {
        // DIUBAH: Hapus semua form input, ganti dengan halaman selamat datang
        this.container.innerHTML = `
            <div class="card auth-card">
                <div class="page-specific-header">
                    <div class="page-header-logo"><i class="fas fa-recycle"></i> SmartWaste</div>
                </div>
                <h2>Selamat Datang!</h2>
                <p>Masuk atau daftar untuk mengakses semua fitur pengelolaan sampah cerdas.</p>
                <div class="auth-action">
                    <button class="btn" id="auth-action-btn">
                        <i class="fas fa-sign-in-alt"></i> Masuk / Daftar
                    </button>
                </div>
                <p class="auth-provider-info">
                    Proses autentikasi aman disediakan oleh Auth0.
                </p>
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        // DIUBAH: Hanya ada satu event listener untuk satu tombol aksi
        this.bind('click', '#auth-action-btn', () => {
            // Panggil metode presenter untuk memulai proses autentikasi
            if (this.presenter && this.presenter.handleAuthAction) {
                this.presenter.handleAuthAction();
            }
        });
    }

    // Metode-metode lama (setLoginHandler, setRegisterHandler, showMessage, clearForm)
    // tidak lagi diperlukan dan bisa dihapus untuk menjaga kebersihan kode.
}

export default AuthView;