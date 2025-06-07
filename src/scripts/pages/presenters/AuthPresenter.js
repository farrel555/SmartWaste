// src/scripts/pages/presenters/AuthPresenter.js

import DataService from '../models/DataService'; // Path OK: 'models' di pages/
import AuthView from '../views/AuthView';       // Path OK: 'views' di pages/

class AuthPresenter {
    constructor(view, appRouter) {
        this.view = view;
        this.appRouter = appRouter; // Untuk navigasi setelah autentikasi
        this.dataService = DataService;

        this.view.setLoginHandler(this.handleLogin.bind(this));
        this.view.setRegisterHandler(this.handleRegister.bind(this));
    }

    init() {
        // Cek status login saat presenter diinisialisasi
        if (this.dataService.isLoggedIn()) {
            this.appRouter.navigateTo('dashboard'); // Langsung ke dashboard jika sudah login
        } else {
            this.view.render(); // Tampilkan form login jika belum login
        }
    }

    async handleLogin(username, password) {
        if (!username || !password) {
            this.view.showMessage('Username dan password harus diisi.', 'error');
            return;
        }

        this.view.showMessage('Mencoba login...', 'info');
        const success = await this.dataService.login(username, password);

        if (success) {
            this.view.showMessage('Login berhasil!', 'success');
            setTimeout(() => {
                this.appRouter.navigateTo('dashboard'); // Navigasi ke dashboard setelah beberapa saat
            }, 1000);
        } else {
            this.view.showMessage('Username atau password salah.', 'error');
        }
    }

    async handleRegister(username, password) {
        if (!username || !password) {
            this.view.showMessage('Username dan password harus diisi.', 'error');
            return;
        }

        this.view.showMessage('Mencoba registrasi...', 'info');
        const success = await this.dataService.register(username, password);

        if (success) {
            this.view.showMessage('Registrasi berhasil! Silakan login.', 'success');
            // Opsional: kosongkan form atau navigasi ke login view
            // this.view.clearForm(); // Jika AuthView punya metode clearForm()
        } else {
            this.view.showMessage('Registrasi gagal. Coba username lain.', 'error');
        }
    }
}

export default AuthPresenter;