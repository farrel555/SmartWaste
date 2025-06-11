class ClassificationService {
    /**
     * Mengirim data gambar ke backend Netlify Function untuk diklasifikasi.
     * @param {string} imageSrc - Data gambar dalam format base64 data URL.
     * @returns {Promise<object>} Objek hasil klasifikasi.
     */
    async classifyImage(imageSrc) {
        console.log('Mengirim gambar ke Netlify Function untuk klasifikasi...');

        try {
            // Panggil endpoint function '/.netlify/functions/predict'
            const response = await fetch('/.netlify/functions/predict', {
                method: 'POST',
                // Kirim data gambar base64 di dalam body JSON
                body: JSON.stringify({ image: imageSrc }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mendapatkan hasil klasifikasi dari API.');
            }

            const result = await response.json();
            console.log('Hasil diterima dari Netlify Function:', result);
            return result;

        } catch (error) {
            console.error('Error saat memanggil API klasifikasi:', error);
            throw error;
        }
    }
}

export default new ClassificationService();