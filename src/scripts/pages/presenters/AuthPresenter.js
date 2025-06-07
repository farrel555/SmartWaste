// src/scripts/pages/presenters/AuthPresenter.js (Versi Final untuk Netlify Identity)

import AuthService from '../../services/AuthService';

class AuthPresenter {
    constructor(view) {
        this.view = view;
        this.view.presenter = this;
    }

    init() {
        this.view.render();
    }

    handleAuthAction() {
        // Memanggil AuthService untuk membuka widget popup Netlify Identity
        AuthService.login(); 
    }
}

export default AuthPresenter;