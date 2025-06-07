// src/scripts/app.js (Disesuaikan kembali untuk Netlify Identity)

import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import ScanView from './views/ScanView';
import ClassificationView from './views/ClassificationView';
import RecommendationView from './views/RecommendationView';
import AuthPresenter from './presenters/AuthPresenter';
import AuthService from '../services/AuthService'; 

class AppRouter {
    constructor(appContainerId) {
        this.appContainer = document.getElementById(appContainerId);
        this.routes = {};
        this.currentPresenter = null;

        this.renderGlobalLayout();

        // Referensi elemen UI global
        this.menuToggleBtn = document.getElementById('menu-toggle-btn');
        this.menuCloseBtn = document.getElementById('menu-close-btn');
        this.sideMenu = document.getElementById('side-menu');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.logoutMenuItem = document.getElementById('logout-menu-item');

        // Inisialisasi Views
        this.authView = new AuthView('main-content-area');
        this.dashboardView = new DashboardView('main-content-area');
        // ... (views lain)
        this.scanView = new ScanView('main-content-area');
        this.classificationView = new ClassificationView('main-content-area');
        this.recommendationView = new RecommendationView('main-content-area');

        this.authPresenter = new AuthPresenter(this.authView);

        // Inisialisasi dan ikat event Netlify Identity
        AuthService.init();
        this.bindAuthEvents();

        this.bindGlobalEvents();
        this.setupRoutes(); // Ini bisa jadi async karena dynamic import
        this.bindPopstateEvent();
        
        this.updateUIVisibility();
    }

    renderGlobalLayout() {
        // ... (Tidak ada perubahan di sini)
    }

    bindGlobalEvents() {
        // ... (Tidak ada perubahan pada toggleMenu dan navigasi menu item)
        this.menuToggleBtn.addEventListener('click', () => this.toggleMenu(true));
        this.menuCloseBtn.addEventListener('click', () => this.toggleMenu(false));
        this.menuOverlay.addEventListener('click', () => this.toggleMenu(false));

        this.sideMenu.querySelectorAll('.menu-items li[data-route]').forEach(item => {
            item.addEventListener('click', (event) => {
                const route = event.currentTarget.dataset.route;
                this.navigateTo(route);
                this.toggleMenu(false);
            });
        });

        // Logika logout sekarang memanggil AuthService versi Netlify Identity
        this.logoutMenuItem.addEventListener('click', () => {
            AuthService.logout(() => {
                console.log("Logout berhasil, event akan menangani redirect.");
            });
            this.toggleMenu(false);
        });
    }

    bindAuthEvents() {
        // Metode ini mendengarkan event dari widget
        AuthService.on('login', (user) => {
            console.log('Pengguna berhasil login:', user);
            this.updateUIVisibility();
            this.navigateTo('dashboard');
        });

        AuthService.on('logout', () => {
            console.log('Pengguna berhasil logout.');
            this.updateUIVisibility();
            this.navigateTo('auth');
        });
    }
    
    updateUIVisibility() {
        const user = AuthService.getCurrentUser();
        if (user) {
            this.menuToggleBtn.style.display = 'block';
            this.logoutMenuItem.style.display = 'flex';
        } else {
            this.menuToggleBtn.style.display = 'none';
            this.sideMenu.classList.remove('open');
            this.menuOverlay.classList.remove('open');
            this.logoutMenuItem.style.display = 'none';
        }
    }

    toggleMenu(open) { /* ... (tidak ada perubahan) ... */ }

    async setupRoutes() {
        try {
            const { default: ScanPresenter } = await import('./presenters/ScanPresenter');
            this.scanPresenter = new ScanPresenter(this.scanView, this.classificationView, this.recommendationView, this);
            
            this.routes = {
                'auth': { presenter: this.authPresenter },
                'dashboard': { view: this.dashboardView },
                'scan': { presenter: this.scanPresenter },
            };

            this.handleInitialRoute();
        } catch (error) {
            console.error("Gagal memuat presenter:", error);
        }
    }

    navigateTo(path, ...args) {
        const user = AuthService.getCurrentUser();
        if (!user && path !== 'auth') {
            this.navigateTo('auth');
            return;
        }

        const routeConfig = this.routes[path];
        if (routeConfig) {
            const mainContent = this.appContainer.querySelector('#main-content-area');
            mainContent.innerHTML = '';
            
            if (routeConfig.presenter) {
                routeConfig.presenter.init(...args);
            } else if (routeConfig.view) {
                routeConfig.view.render(...args);
            }
            
            window.history.pushState({ path: path, args: args }, '', `#${path}`);
        } else {
            this.navigateTo(user ? 'dashboard' : 'auth');
        }
    }

    bindPopstateEvent() {
        window.addEventListener('popstate', (event) => {
            const path = event.state?.path || (AuthService.getCurrentUser() ? 'dashboard' : 'auth');
            this.navigateTo(path, ...(event.state?.args || []));
        });
    }

    handleInitialRoute() {
        const hash = window.location.hash.slice(1);
        const user = AuthService.getCurrentUser();
        if (user) {
            this.navigateTo(hash && this.routes[hash] ? hash : 'dashboard');
        } else {
            this.navigateTo('auth');
        }
    }
}

export function initializeApp() {
    new AppRouter('app');
    console.log('Aplikasi SmartWaste (MVP + Netlify Identity) telah diinisialisasi.');
}