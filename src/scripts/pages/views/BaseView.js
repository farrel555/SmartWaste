class BaseView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container dengan ID '${containerId}' tidak ditemukan.`);
        }
    }

    // Metode untuk merender konten ke dalam kontainer
    render(content) {
        if (this.container) {
            this.container.innerHTML = content;
        }
    }

    // Metode untuk menambahkan event listener menggunakan event delegation
    bind(eventName, selector, handler) {
        if (this.container) {
            this.container.addEventListener(eventName, (event) => {
                if (event.target.matches(selector)) {
                    handler(event);
                }
            });
        }
    }
}

export default BaseView;