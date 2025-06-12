import CreativeProductsService from '../../services/CreativeProductsService';
import CreativeProduct from '../models/CreativeProduct';

class CreativeProductsPresenter {
    constructor(view) {
        this.view = view;
        this.view.presenter = this;
    }

    async init(category) {
        this.view.showLoading();
        try {
            const allProducts = await CreativeProductsService.getProducts();
            const filteredProducts = allProducts.filter(p => p.category === category);
            
            const productModels = filteredProducts.map(p => new CreativeProduct(p));
            
            this.view.render(productModels, category);
        } catch (error) {
            console.error('Gagal memuat produk kreatif:', error);
            // Anda bisa membuat metode showError di view jika perlu
        }
    }
}

export default CreativeProductsPresenter;