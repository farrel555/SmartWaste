import { createAuth0Client } from '@auth0/auth0-spa-js';

/**
 * Singleton service untuk mengelola semua interaksi dengan Auth0.
 */
class AuthService {
    constructor() {
        this.auth0Client = null;
        this.isAuthenticated = false;
        this.user = null;
    }

    /**
     * Menginisialisasi client Auth0. Harus dipanggil sekali saat aplikasi dimuat.
     * Metode ini juga menangani redirect callback dari Auth0.
     * @returns {Promise<AuthService|null>} Instance AuthService jika berhasil, atau null jika gagal.
     */
    async init() {
        try {
            this.auth0Client = await createAuth0Client({
                domain: process.env.AUTH0_DOMAIN,
                clientId: process.env.AUTH0_CLIENT_ID,
                authorizationParams: {
                    redirect_uri: window.location.origin,
                },
            });

            // Jika URL mengandung 'code' dan 'state', berarti pengguna baru saja kembali dari login Auth0.
            if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
                console.log('Mendeteksi callback dari Auth0, memproses token...');
                await this.auth0Client.handleRedirectCallback();
                // Membersihkan parameter dari URL agar terlihat rapi.
                window.history.replaceState({}, document.title, '/');
            }

            this.isAuthenticated = await this.auth0Client.isAuthenticated();

            if (this.isAuthenticated) {
                this.user = await this.auth0Client.getUser();
                console.log('Pengguna terautentikasi:', this.user);
            } else {
                console.log('Tidak ada pengguna yang terautentikasi.');
            }

            console.log('AuthService berhasil diinisialisasi.');
            return this;
        } catch (error) {
            console.error('Error saat inisialisasi AuthService:', error);
            return null;
        }
    }

    /**
     * Mengalihkan (redirect) pengguna ke halaman login Universal Login Auth0.
     */
    login() {
        if (!this.auth0Client) {
            console.error('Auth client belum siap. Proses login dibatalkan.');
            return;
        }
        return this.auth0Client.loginWithRedirect();
    }

    /**
     * Mengeluarkan pengguna dari sesi Auth0 dan mengembalikannya ke halaman utama.
     */
    logout() {
        if (!this.auth0Client) return;
        return this.auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    }

    /**
     * Mendapatkan profil pengguna yang sedang login.
     * @returns {object|null} Objek profil pengguna atau null jika tidak login.
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Memeriksa apakah ada pengguna yang sedang login.
     * @returns {boolean} True jika terautentikasi, false jika tidak.
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * (FITUR TAMBAHAN) Mendapatkan access token untuk memanggil API yang terproteksi.
     * @returns {Promise<string|null>} Access token dalam bentuk string atau null jika gagal.
     */
    async getToken() {
        if (this.auth0Client && this.isAuthenticated) {
            try {
                // Mencoba mendapatkan token secara diam-diam tanpa interaksi pengguna.
                const token = await this.auth0Client.getTokenSilently();
                return token;
            } catch (error) {
                console.error('Gagal mendapatkan token:', error);
                return null;
            }
        }
        return null;
    }
}

// Ekspor sebagai singleton agar hanya ada satu instance di seluruh aplikasi.
export default new AuthService();