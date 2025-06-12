// Ini adalah data dummy. Nanti bisa diganti dengan fetch ke API.
const DUMMY_PRODUCTS = [
    { id: 'n1', name: 'Lampu Hias dari Sendok Plastik Bekas', description: 'Sendok plastik sekali pakai bisa dirangkai pada kerangka (misalnya botol galon bekas) untuk menciptakan kap lampu yang modern dan artistik.', imageUrl: '/images/lampu-hias.jpg', category: 'nonorganik' },
    { id: 'n2', name: 'Furnitur dari Ecobrick', description: 'Ecobrick (botol plastik yang dipadatkan dengan sampah plastik) yang disusun dan diikat dengan kuat bisa menjadi modul untuk membuat kursi, meja, atau bahkan panggung kecil yang fungsional dan kokoh.', imageUrl: '/images/furnitur-brik.jpg', category: 'nonorganik' },
    { id: 'n3', name: 'Mozaik dari Tutup Botol', description: 'Kumpulkan aneka warna tutup botol untuk menciptakan karya seni mozaik yang penuh warna. Ini bisa diaplikasikan di dinding, papan, atau meja', imageUrl: '/images/mozaik-tutol.jpg', category: 'nonorganik' },
    { id: 'o1', name: 'Mangkuk dan Sendok dari Batok Kelapa', description: 'Batok kelapa yang seringkali dibuang bisa dihaluskan dan diubah menjadi peralatan makan yang estetik, aman untuk makanan, dan bernilai jual tinggi.', imageUrl: '/images/mangkuk-sendok.jpg', category: 'organik' },
    { id: 'o2', name: 'Mozaik Artistik dari Cangkang Telur', description: 'Jangan buang cangkang telur. Setelah dibersihkan, pecahannya bisa ditempel dengan teliti untuk membuat karya seni mozaik yang detail dan bertekstur unik pada kanvas, kotak perhiasan, atau vas.', imageUrl: '/images/mozaik-artistik.jpg', category: 'organik' },
    { id: 'o3', name: 'Tas dari Anyaman Pelepah Pisang Kering', description: 'Pelepah pisang yang sudah dikeringkan dapat diolah menjadi serat yang kuat untuk dianyam. Hasilnya adalah produk fesyen seperti tas, topi, atau sandal yang ramah lingkungan.', imageUrl: '/images/tas-anyam.jpg', category: 'organik' },
    { id: 'o4', name: 'Pupuk Kompos Padat (Compost)', description: 'Ini adalah jenis pupuk organik yang paling umum. Dibuat dengan cara menguraikan sampah hijau (sisa sayur, buah, daun) dan sampah cokelat (daun kering, kardus, sekam) dalam waktu tertentu hingga menjadi material yang gembur, berwarna gelap, dan kaya akan nutrisi seperti tanah.', imageUrl: '/images/kompos.jpg', category: 'organik' },
    { id: 'o5', name: 'Pupuk Organik Cair (POC) / Eco-Enzyme', description: 'Pupuk ini dibuat melalui proses fermentasi sampah organik (terutama sisa buah dan sayuran manis) dengan air dan gula (gula merah atau molase). Hasilnya adalah cairan kaya mikroorganisme yang sangat baik untuk tanaman', imageUrl: '/images/eco-enzym.jpg', category: 'organik' },
    { id: 'o6', name: 'Pupuk Bokashi', description: 'Bokashi adalah metode pengomposan cepat melalui proses fermentasi anaerob (tanpa udara) dengan bantuan starter mikroorganisme (biasanya EM4). Metode ini bisa mengolah lebih banyak jenis sampah dapur, termasuk nasi, ampas kelapa, bahkan tulang ikan.', imageUrl: '/images/pupuk-bokashi', category: 'organik' },
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