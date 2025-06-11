// src/scripts/services/ClassificationService.js
const API_BASE_URL = 'https://smartwaste-api.fly.dev/'; 

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
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Gagal mendapatkan hasil klasifikasi dari API.');
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