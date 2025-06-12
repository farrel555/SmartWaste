// Ini adalah data dummy. Nanti bisa diganti dengan fetch ke API.
const DUMMY_PRODUCTS = [
    { id: 'o1', name: 'Pupuk Kompos dari Sisa Dapur', description: 'Pupuk alami yang kaya nutrisi untuk tanaman Anda, dibuat dari sisa sayur dan buah.', imageUrl: 'https://via.placeholder.com/150', category: 'organik' },
    { id: 'o2', name: 'Lilin Aromaterapi dari Kulit Jeruk', description: 'Ciptakan suasana rileks dengan lilin wangi yang dibuat dari kulit jeruk kering.', imageUrl: 'https://via.placeholder.com/150', category: 'organik' },
    { id: 'n1', name: 'Tas Belanja dari Botol Plastik', description: 'Tas kuat dan stylish yang ditenun dari lelehan botol plastik bekas.', imageUrl: 'https://via.placeholder.com/150', category: 'nonorganik' },
    { id: 'n2', name: 'Pot Bunga Unik dari Kaleng Bekas', description: 'Hias kebun Anda dengan pot bunga berwarna-warni yang dibuat dari kaleng bekas susu atau makanan.', imageUrl: 'https://via.placeholder.com/150', category: 'nonorganik' },
];

class CreativeProductsService {
    async getProducts() {
        // Mensimulasikan pemanggilan API
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(DUMMY_PRODUCTS);
            }, 500);
        });
    }
}

export default new CreativeProductsService();