// src/scripts/app.js

// Impor Views
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import ScanView from './views/ScanView';
import ClassificationView from './views/ClassificationView';
import RecommendationView from './views/RecommendationView';

// Impor Presenters
import AuthPresenter from './presenters/AuthPresenter';

// DIUBAH: Gunakan AuthService yang dirancang untuk Auth0
import AuthService from '../services/AuthService'; 

class AppRouter {
    constructor(appContainerId) {
        this.appContainer = document.getElementById(appContainerId);
        this.routes = {};
        this.currentPresenter = null;

        // DIUBAH: Seluruh proses inisialisasi dipindahkan ke metode async
        this.initializeApp();
    }

    // BARU: Metode inisialisasi utama yang bersifat asynchronous
    async initializeApp() {
        // Tampilkan loading screen sederhana
        this.appContainer.innerHTML = '<div class="loading-screen"><h2>Memuat SmartWaste...</h2></div>';
        
        // Tunggu hingga AuthService (Auth0) selesai melakukan pengecekan awal
        await AuthService.init();

        // Setelah Auth selesai, baru render layout utama dan lanjutkan
        this.renderGlobalLayout();
        this.setupElements();
        this.setupViewsAndPresenters();
        this.bindGlobalEvents();
        await this.setupRoutes(); // setupRoutes juga perlu async karena ada dynamic import

        this.bindPopstateEvent();
        this.handleInitialRoute();
        this.updateUIVisibility();

        console.log('Aplikasi SmartWaste (MVP + Auth0) telah diinisialisasi.');
    }

    setupElements() {
        this.menuToggleBtn = document.getElementById('menu-toggle-btn');
        this.menuCloseBtn = document.getElementById('menu-close-btn');
        this.sideMenu = document.getElementById('side-menu');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.logoutMenuItem = document.getElementById('logout-menu-item');
    }
    
    setupViewsAndPresenters() {
        this.authView = new AuthView('main-content-area');
        this.dashboardView = new DashboardView('main-content-area');
        this.scanView = new ScanView('main-content-area');
        this.classificationView = new ClassificationView('main-content-area');
        this.recommendationView = new RecommendationView('main-content-area');

        this.authPresenter = new AuthPresenter(this.authView);
    }
    
    renderGlobalLayout() {
        this.appContainer.innerHTML = `
            <header class="app-header">
                <div class="header-left-content">
                    <button id="menu-toggle-btn" class="menu-button"><i class="fas fa-bars"></i></button>
                    <div class="app-logo-text"><i class="fas fa-recycle"></i> SmartWaste</div>
                </div>
                <div class="header-right-content"></div>
            </header>
            <div id="side-menu" class="side-menu">
                <div class="menu-header">
                    <div class="logo-text"><i class="fas fa-recycle"></i> SmartWaste</div>
                    <button id="menu-close-btn" class="menu-button"><i class="fas fa-times"></i></button>
                </div>
                <ul class="menu-items">
                    <li data-route="dashboard"><i class="fas fa-chart-line"></i> Dashboard</li>
                    <li data-route="scan"><i class="fas fa-camera"></i> Scan Sampah</li>
                    <li id="logout-menu-item"><i class="fas fa-sign-out-alt"></i> Logout</li>
                </ul>
            </div>
            <div id="menu-overlay" class="menu-overlay"></div>
            <main id="main-content-area" class="main-content"></main>
        `;
    }

    bindGlobalEvents() {
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

        // DIUBAH: Logout sekarang memanggil metode logout dari AuthService versi Auth0
        this.logoutMenuItem.addEventListener('click', () => {
            AuthService.logout();
            this.toggleMenu(false);
        });
    }

    updateUIVisibility() {
        const isAuthenticated = AuthService.isUserAuthenticated();
        if (isAuthenticated) {
            this.menuToggleBtn.style.display = 'block';
            this.logoutMenuItem.style.display = 'flex';
        } else {
            this.menuToggleBtn.style.display = 'none';
            this.sideMenu.classList.remove('open');
            this.menuOverlay.classList.remove('open');
            this.logoutMenuItem.style.display = 'none';
        }
    }

    toggleMenu(open) {
        if (open) {
            this.sideMenu.classList.add('open');
            this.menuOverlay.classList.add('open');
        } else {
            this.sideMenu.classList.remove('open');
            this.menuOverlay.classList.remove('open');
        }
    }

    // DIUBAH: setupRoutes sekarang menjadi async karena menggunakan await
    async setupRoutes() {
        try {
            const { default: ScanPresenter } = await import('./presenters/ScanPresenter');
            this.scanPresenter = new ScanPresenter(
                this.scanView,
                this.classificationView,
                this.recommendationView,
                this
            );
            
            this.routes = {
                'auth': { presenter: this.authPresenter, title: 'Autentikasi' },
                'dashboard': { view: this.dashboardView, title: 'Dashboard' },
                'scan': { presenter: this.scanPresenter, title: 'Scan Sampah' },
            };
        } catch (error) {
            console.error("Gagal memuat ScanPresenter:", error);
            document.getElementById('main-content-area').innerHTML = '<div class="card error-card"><h2>Error Memuat Aplikasi</h2></div>';
        }
    }

    navigateTo(path, ...args) {
        const isAuthenticated = AuthService.isUserAuthenticated();

        // DIUBAH: Logika perlindungan rute untuk Auth0
        if (!isAuthenticated && path !== 'auth') {
            console.log('Akses ditolak. Memulai proses login...');
            AuthService.login(); // Mengalihkan pengguna ke halaman login Auth0
            return;
        }

        if (this.routes[path]) {
            const mainContent = this.appContainer.querySelector('#main-content-area');
            mainContent.innerHTML = '';
            
            const routeConfig = this.routes[path];
            if (routeConfig.presenter) {
                routeConfig.presenter.init(...args);
            } else if (routeConfig.view) {
                routeConfig.view.render(...args);
            }
            
            window.history.pushState({ path: path, args: args }, '', `#${path}`);
        } else {
            // Jika rute tidak ditemukan, arahkan ke halaman yang sesuai
            this.navigateTo(isAuthenticated ? 'dashboard' : 'auth');
        }
    }

    bindPopstateEvent() {
        window.addEventListener('popstate', (event) => {
            const isAuthenticated = AuthService.isUserAuthenticated();
            const path = event.state?.path || (isAuthenticated ? 'dashboard' : 'auth');
            const args = event.state?.args || [];
            this.navigateTo(path, ...args);
        });
    }

    handleInitialRoute() {
        // Logika ini dijalankan setelah AuthService.init() menangani redirect callback
        const isAuthenticated = AuthService.isUserAuthenticated();
        const hash = window.location.hash.slice(1);

        if (isAuthenticated) {
            this.navigateTo(hash && this.routes[hash] ? hash : 'dashboard');
        } else {
            this.navigateTo('auth');
        }
    }
}

// BARU: Fungsi initializeApp sekarang hanya memanggil constructor AppRouter
export function initializeApp() {
    new AppRouter('app');
}