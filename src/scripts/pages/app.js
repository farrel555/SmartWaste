// src/scripts/app.js

// Impor Views
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import ScanView from './views/ScanView';
import ClassificationView from './views/ClassificationView';
import RecommendationView from './views/RecommendationView';
import HistoryView from './views/HistoryView';

// Impor Presenters
import AuthPresenter from './presenters/AuthPresenter';
import HistoryPresenter from './presenters/HistoryPresenter';

// Impor Services
import AuthService from '../services/AuthService'; 

class AppRouter {
    constructor(appContainerId) {
        this.appContainer = document.getElementById(appContainerId);
        if (!this.appContainer) {
            console.error(`Elemen dengan ID '${appContainerId}' tidak ditemukan.`);
            return;
        }

        this.routes = {};
        this.currentPresenter = null;

        // 1. Render layout HTML dasar terlebih dahulu
        this.renderGlobalLayout();
        // 2. Setelah HTML ada, baru cari elemen-elemennya
        this.setupElements();
        // 3. Inisialisasi Views dan Presenters
        this.setupViewsAndPresenters();
        // 4. Inisialisasi dan ikat event dari AuthService (Netlify Identity)
        AuthService.init();
        this.bindAuthEvents();
        // 5. Ikat event-event global ke elemen yang sudah ditemukan
        this.bindGlobalEvents();
        // 6. Siapkan rute dan navigasi awal (sekarang async)
        this.setupRoutes();
        // 7. Ikat event popstate untuk navigasi browser
        this.bindPopstateEvent();
        // 8. Sesuaikan UI berdasarkan status login awal
        this.updateUIVisibility();
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
                    <li data-route="history"><i class="fas fa-history"></i> Riwayat Scan</li>
                    <li id="logout-menu-item"><i class="fas fa-sign-out-alt"></i> Logout</li>
                </ul>
            </div>
            <div id="menu-overlay" class="menu-overlay"></div>
            <main id="main-content-area" class="main-content"></main>
        `;
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
        this.historyView = new HistoryView('main-content-area');

        this.authPresenter = new AuthPresenter(this.authView);
        this.historyPresenter = new HistoryPresenter(this.historyView);
    }

    bindGlobalEvents() {
        this.menuToggleBtn.addEventListener('click', () => this.toggleMenu(true));
        this.menuCloseBtn.addEventListener('click', () => this.toggleMenu(false));
        this.menuOverlay.addEventListener('click', () => this.toggleMenu(false));

        this.sideMenu.querySelectorAll('.menu-items li[data-route]').forEach(item => {
            item.addEventListener('click', (event) => {
                this.navigateTo(event.currentTarget.dataset.route);
                this.toggleMenu(false);
            });
        });

        this.logoutMenuItem.addEventListener('click', () => {
            AuthService.logout(() => console.log("Logout callback dijalankan."));
            this.toggleMenu(false);
        });
    }

    bindAuthEvents() {
        AuthService.on('login', (user) => {
            console.log('Event Login terdeteksi:', user);
            this.updateUIVisibility();
            this.navigateTo('dashboard');
        });

        AuthService.on('logout', () => {
            console.log('Event Logout terdeteksi.');
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

    toggleMenu(open) {
        if (open) {
            this.sideMenu.classList.add('open');
            this.menuOverlay.classList.add('open');
        } else {
            this.sideMenu.classList.remove('open');
            this.menuOverlay.classList.remove('open');
        }
    }

    async setupRoutes() {
        try {
            const { default: ScanPresenter } = await import('./presenters/ScanPresenter');
            this.scanPresenter = new ScanPresenter(
                this.scanView, 
                this.classificationView, 
                this.recommendationView, 
                this
            );
            
            // Menambahkan semua rute yang mungkin diakses
            this.routes = {
                'auth': { presenter: this.authPresenter },
                'dashboard': { view: this.dashboardView },
                'scan': { presenter: this.scanPresenter },
                'history': { presenter: this.historyPresenter },
                'classification': { view: this.classificationView }, // Rute untuk menampilkan hasil
                'recommendation': { view: this.recommendationView }, // Rute untuk rekomendasi
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
    console.log('Aplikasi SmartWaste (MVP + Netlify Identity + History) telah diinisialisasi.');
}