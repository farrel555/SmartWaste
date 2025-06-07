// src/scripts/services/AuthService.js (Versi untuk Netlify Identity)

class AuthService {
    /**
     * Inisialisasi listener Netlify Identity.
     */
    init() {
        // Objek netlifyIdentity dibuat secara global oleh skrip dari index.html
        if (window.netlifyIdentity) {
            window.netlifyIdentity.on('init', user => {
                if (!user) {
                    window.netlifyIdentity.on('login', () => {
                        // Arahkan ke dashboard setelah login
                        document.location.href = '/#dashboard';
                    });
                }
            });
        }
    }

    /**
     * Mendapatkan data pengguna yang sedang login.
     * @returns {object|null} Objek pengguna atau null.
     */
    getCurrentUser() {
        return window.netlifyIdentity ? window.netlifyIdentity.currentUser() : null;
    }

    /**
     * Membuka widget untuk login.
     */
    login() {
        if (window.netlifyIdentity) {
            window.netlifyIdentity.open('login');
        }
    }

    /**
     * Membuka widget untuk signup.
     */
    signup() {
        if (window.netlifyIdentity) {
            window.netlifyIdentity.open('signup');
        }
    }

    /**
     * Melakukan proses logout.
     * @param {Function} callback - Fungsi yang akan dipanggil setelah logout selesai.
     */
    logout(callback) {
        if (window.netlifyIdentity) {
            window.netlifyIdentity.logout().then(callback);
        }
    }

    /**
     * Meneruskan event listener ke widget Netlify Identity.
     * @param {string} event - Nama event ('login', 'logout', 'error', 'init').
     * @param {Function} callback - Fungsi handler untuk event tersebut.
     */
    on(event, callback) {
        if (window.netlifyIdentity) {
            window.netlifyIdentity.on(event, callback);
        }
    }
}

export default new AuthService();