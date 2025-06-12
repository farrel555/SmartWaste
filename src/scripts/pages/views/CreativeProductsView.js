import BaseView from './BaseView';

class CreativeProductsView extends BaseView {
    render(products = [], category = '') {
        const categoryTitle = category === 'organik' ? 'Organik' : 'Non-Organik';
        
        let itemsHtml = '<p>Belum ada produk untuk kategori ini.</p>';
        if (products.length > 0) {
            itemsHtml = products.map(product => `
                <div class="product-item">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                    </div>
                </div>
            `).join('');
        }

        this.container.innerHTML = `
            <div class="card product-card">
                <div class="page-specific-header">
                    <div class="page-header-logo"><i class="fas fa-lightbulb"></i> Produk Kreatif ${categoryTitle}</div>
                </div>
                <div class="product-list">${itemsHtml}</div>
            </div>
        `;
    }

    showLoading() {
        this.container.innerHTML = '<div class="card"><p>Memuat produk...</p></div>';
    }
}

export default CreativeProductsView;