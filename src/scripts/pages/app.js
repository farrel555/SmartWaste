// src/scripts/app.js

// Impor Views
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import ScanView from './views/ScanView';
import ClassificationView from './views/ClassificationView';
import HistoryView from './views/HistoryView';
import CreativeProductsView from './views/CreativeProductsView'; // BARU

// Impor Presenters
import AuthPresenter from './presenters/AuthPresenter';
import HistoryPresenter from './presenters/HistoryPresenter';
import CreativeProductsPresenter from './presenters/CreativeProductsPresenter'; // BARU

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

        this.renderGlobalLayout();
        this.setupElements();
        this.setupViewsAndPresenters();
        
        AuthService.init();
        this.bindAuthEvents();
        this.bindGlobalEvents();
        
        this.setupRoutes(); // Ini bersifat async
        this.bindPopstateEvent();
        
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
                    
                    <li class="has-submenu">
                        <a href="#" class="menu-toggle-submenu">
                            <i class="fas fa-lightbulb"></i> Produk Kreatif <i class="fas fa-chevron-down submenu-arrow"></i>
                        </a>
                        <ul class="submenu">
                            <li data-route="creative/organik">Organik</li>
                            <li data-route="creative/nonorganik">Non-Organik</li>
                        </ul>
                    </li>

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
        this.historyView = new HistoryView('main-content-area');
        this.creativeProductsView = new CreativeProductsView('main-content-area');

        this.authPresenter = new AuthPresenter(this.authView);
        this.historyPresenter = new HistoryPresenter(this.historyView);
        this.creativeProductsPresenter = new CreativeProductsPresenter(this.creativeProductsView);
    }

    bindGlobalEvents() {
        this.menuToggleBtn.addEventListener('click', () => this.toggleMenu(true));
        this.menuCloseBtn.addEventListener('click', () => this.toggleMenu(false));
        this.menuOverlay.addEventListener('click', () => this.toggleMenu(false));

        // Event listener untuk semua item menu, termasuk sub-menu
        this.sideMenu.querySelectorAll('li[data-route]').forEach(item => {
            item.addEventListener('click', (event) => {
                this.navigateTo(event.currentTarget.dataset.route);
                this.toggleMenu(false);
            });
        });
        
        const submenuToggle = this.sideMenu.querySelector('.menu-toggle-submenu');
        if (submenuToggle) {
            submenuToggle.addEventListener('click', (event) => {
                event.preventDefault();
                event.currentTarget.parentElement.classList.toggle('open');
            });
        }

        this.logoutMenuItem.addEventListener('click', () => {
            AuthService.logout(() => console.log("Logout callback dijalankan."));
            this.toggleMenu(false);
        });
    }

    bindAuthEvents() {
        // ... (Tidak ada perubahan di sini)
    }
    
    updateUIVisibility() {
        // ... (Tidak ada perubahan di sini)
    }

    toggleMenu(open) {
        // ... (Tidak ada perubahan di sini)
    }

    async setupRoutes() {
        try {
            // Import ScanPresenter secara dinamis
            const { default: ScanPresenter } = await import('./presenters/ScanPresenter');
            this.scanPresenter = new ScanPresenter(this.scanView, this.classificationView, null, this);
            this.classificationView.presenter = this.scanPresenter;
            
            // Definisikan semua rute aplikasi
            this.routes = {
                'auth': { presenter: this.authPresenter },
                'dashboard': { view: this.dashboardView },
                'scan': { presenter: this.scanPresenter },
                'history': { presenter: this.historyPresenter },
                'classification': { view: this.classificationView },
                'creative/:category': { presenter: this.creativeProductsPresenter },
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

        const currentHash = window.location.hash.slice(1);
        const mainContent = this.appContainer.querySelector('#main-content-area');
        
        let routeConfig;
        let routeParams = [];
        const pathParts = path.split('/');
        const baseRoute = pathParts[0];

        // Cek rute dinamis seperti 'creative/:category'
        if (this.routes[`${baseRoute}/:category`]) {
            routeConfig = this.routes[`${baseRoute}/:category`];
            routeParams.push(pathParts[1]); // Menangkap 'organik' atau 'nonorganik'
        } else {
            routeConfig = this.routes[path];
        }

        if (routeConfig) {
            if (path !== currentHash) {
                mainContent.innerHTML = ''; // Hanya bersihkan konten jika navigasi ke rute yang benar-benar baru
            }
            
            const allArgs = [...routeParams, ...args];

            if (routeConfig.presenter) {
                routeConfig.presenter.init(...allArgs);
            } else if (routeConfig.view) {
                // Logika khusus untuk ClassificationView
                if (path === 'classification' && allArgs.length === 0) {
                    this.classificationView.showLoading();
                } else {
                    routeConfig.view.render(...allArgs);
                }
            }
            
            if (path !== currentHash) {
                window.history.pushState({ path, args: allArgs }, '', `#${path}`);
            }
        } else {
            // Fallback ke rute default jika rute tidak ditemukan
            this.navigateTo(user ? 'dashboard' : 'auth');
        }
    }

    bindPopstateEvent() {
        // ... (Tidak ada perubahan di sini)
    }

    handleInitialRoute() {
        // ... (Tidak ada perubahan di sini)
    }
}

export function initializeApp() {
    new AppRouter('app');
}