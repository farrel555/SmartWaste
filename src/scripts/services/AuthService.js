import { createAuth0Client } from '@auth0/auth0-spa-js';

class AuthService {
    constructor() {
        this.auth0Client = null;
        this.isAuthenticated = false;
        this.user = null;
    }

    async init() {
        try {
            // Inisialisasi client Auth0
            this.auth0Client = await createAuth0Client({
                domain: process.env.AUTH0_DOMAIN, // Ambil dari environment variables
                clientId: process.env.AUTH0_CLIENT_ID,
                authorizationParams: {
                    redirect_uri: window.location.origin, // URL callback
                },
            });

            // Cek jika pengguna kembali dari redirect Auth0
            if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
                await this.auth0Client.handleRedirectCallback();
                window.history.replaceState({}, document.title, '/'); // Bersihkan URL
            }

            // Perbarui status autentikasi
            this.isAuthenticated = await this.auth0Client.isAuthenticated();
            if (this.isAuthenticated) {
                this.user = await this.auth0Client.getUser();
            }

            console.log('AuthService initialized.');
            return this;
        } catch (error) {
            console.error('Error initializing AuthService:', error);
            return null;
        }
    }

    login() {
        if (!this.auth0Client) return;
        return this.auth0Client.loginWithRedirect();
    }

    logout() {
        if (!this.auth0Client) return;
        return this.auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin, // Kembali ke halaman utama setelah logout
            },
        });
    }

    getCurrentUser() {
        return this.user;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Ekspor sebagai singleton agar hanya ada satu instance
export default new AuthService();