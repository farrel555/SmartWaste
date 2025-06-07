// src/scripts/pages/presenters/AuthPresenter.js

import AuthService from '../../services/AuthService'; // Pastikan path ini benar

class AuthPresenter {
    constructor(view) {
        this.view = view;
        this.view.presenter = this; // Hubungkan presenter ke view
    }

    // Metode ini dipanggil oleh AppRouter untuk merender view awal
    init() {
        this.view.render();
    }

    // Metode ini dipanggil oleh AuthView saat tombol diklik
    handleAuthAction() {
        // Memulai proses login/daftar dengan mengalihkan ke halaman Auth0
        AuthService.login(); 
    }
}

export default AuthPresenter;