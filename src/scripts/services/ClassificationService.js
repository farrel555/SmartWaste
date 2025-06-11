// src/scripts/services/ClassificationService.js

// Mengambil URL API dari environment variable yang disuntikkan oleh Webpack.
// Jika tidak ada, ia akan menggunakan URL live sebagai fallback.
const API_BASE_URL = process.env.API_BASE_URL || 'https://smartwaste-api.fly.dev';

class ClassificationService {
    /**
     * Mengirim data gambar ke backend FastAPI untuk diklasifikasi.
     * @param {string} imageSrc - Data gambar dalam format base64 data URL.
     * @returns {Promise<object>} Objek hasil klasifikasi.
     */
    async classifyImage(imageSrc) {
        console.log(`Mengirim gambar ke backend: ${API_BASE_URL}`);

        try {
            // Ubah data URL base64 menjadi objek Blob agar bisa dikirim sebagai file
            const fetchRes = await fetch(imageSrc);
            const blob = await fetchRes.blob();
            
            // Buat objek FormData untuk mengirim file
            const formData = new FormData();
            formData.append('file', blob, 'image.jpg');

            // Kirim request ke endpoint /predict di backend FastAPI Anda
            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                body: formData,
                // Saat menggunakan FormData, header 'Content-Type' akan diatur otomatis oleh browser
            });

            if (!response.ok) {
                // Penanganan error yang lebih baik untuk berbagai jenis respons
                let errorMsg = `Gagal mendapatkan hasil klasifikasi. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.detail || errorMsg;
                } catch (e) {
                    // Biarkan pesan error default jika respons bukan JSON
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            console.log('Hasil diterima dari FastAPI:', result);
            return result;

        } catch (error) {
            console.error('Error saat memanggil API klasifikasi:', error);
            throw error; // Teruskan error agar bisa ditangani oleh presenter
        }
    }
}

export default new ClassificationService();