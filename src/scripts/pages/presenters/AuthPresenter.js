// src/scripts/pages/presenters/AuthPresenter.js

import AuthService from '../../services/AuthService'; // Pastikan path ini benar

class AuthPresenter {
    constructor(view) {
        this.view = view;
        this.view.presenter = this;
    }

    init() {
        this.view.render();
    }

    // Metode ini dipanggil dari AuthView saat tombol diklik
    handleAuthAction() {
        // Memanggil AuthService untuk membuka widget popup Netlify Identity
        AuthService.login(); 
    }
}

export default AuthPresenter;