// src/scripts/services/ClassificationService.js

// LANGSUNG TULIS URL API ANDA DI SINI
// Ganti dengan URL dari Fly.io, Render, atau layanan hosting backend Anda.
const API_BASE_URL = 'https://smartwaste-api.fly.dev'; 

class ClassificationService {
    /**
     * Mengirim data gambar ke backend FastAPI untuk diklasifikasi.
     * @param {string} imageSrc - Data gambar dalam format base64 data URL.
     * @returns {Promise<object>} Objek hasil klasifikasi.
     */
    async classifyImage(imageSrc) {
        console.log(`Mengirim gambar ke backend: ${API_BASE_URL}`);

        try {
            const fetchRes = await fetch(imageSrc);
            const blob = await fetchRes.blob();
            
            const formData = new FormData();
            formData.append('file', blob, 'image.jpg');

            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
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
            throw error;
        }
    }
}

export default new ClassificationService();