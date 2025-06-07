// src/scripts/pages/views/AuthView.js

import BaseView from './BaseView';

class AuthView extends BaseView {
    constructor(containerId) {
        super(containerId);
        this.loginHandler = null;
        this.registerHandler = null;
    }

    render() {
        this.container.innerHTML = `
            <div class="card auth-card">
                <h2>Autentikasi</h2>
                <div class="form-group">
                    <label for="auth-username">Username:</label>
                    <input type="text" id="auth-username" placeholder="Masukkan Username">
                </div>
                <div class="form-group">
                    <label for="auth-password">Password:</label>
                    <input type="password" id="auth-password" placeholder="Masukkan Password">
                </div>
                <button class="btn" id="login-btn">Login</button>
                <button class="btn btn-secondary" id="register-btn">Register</button>
                <div class="user-info">
                    <h3>Nama: Nama</h3>
                    <p>Current: None</p>
                    <p>Login: Logout</p>
                </div>
                
                <div id="auth-message" class="message"></div> 
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        this.bind('click', '#login-btn', () => {
            const username = this.container.querySelector('#auth-username').value;
            const password = this.container.querySelector('#auth-password').value;
            if (this.loginHandler) {
                this.loginHandler(username, password);
            }
        });

        this.bind('click', '#register-btn', () => {
            const username = this.container.querySelector('#auth-username').value;
            const password = this.container.querySelector('#auth-password').value;
            if (this.registerHandler) {
                this.registerHandler(username, password);
            }
        });
    }

    setLoginHandler(handler) {
        this.loginHandler = handler;
    }

    setRegisterHandler(handler) {
        this.registerHandler = handler;
    }

    // Metode untuk menampilkan pesan di UI
    showMessage(message, type = 'success') {
        const messageDiv = this.container.querySelector('#auth-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`; // Menambahkan class CSS untuk styling
            setTimeout(() => {
                messageDiv.textContent = ''; // Hapus pesan setelah 3 detik
                messageDiv.className = 'message'; // Bersihkan kelas styling
            }, 3000); 
        } else {
            console.warn(`Auth Message (${type}): ${message} - Elemen pesan feedback tidak ditemukan.`);
        }
    }
    
    // Metode opsional untuk mengosongkan form (jika diperlukan setelah register/login)
    clearForm() {
        this.container.querySelector('#auth-username').value = '';
        this.container.querySelector('#auth-password').value = '';
    }
}

export default AuthView;