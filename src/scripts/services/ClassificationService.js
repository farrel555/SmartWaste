// src/scripts/services/ClassificationService.js (Versi TensorFlow.js)

import * as tf from '@tensorflow/tfjs';

const MODEL_URL = './tfjs_model/model.json'; // Path ke model Anda di folder public
const IMAGE_SIZE = 150; // Sesuaikan dengan ukuran input model Anda saat training
const CLASSES = ['Non_Organik', 'Organik']; // Sesuaikan dengan nama kelas Anda

class ClassificationService {
    constructor() {
        this.model = null;
    }

    /**
     * Memuat model TensorFlow.js. Hanya dijalankan sekali.
     */
    async loadModel() {
        // Jika model sudah dimuat, jangan muat lagi
        if (this.model) {
            return;
        }
        try {
            console.log('Memuat model...');
            this.model = await tf.loadGraphModel(MODEL_URL);
            console.log('Model berhasil dimuat.');
        } catch (error) {
            console.error('Gagal memuat model:', error);
            throw new Error('Gagal mempersiapkan model klasifikasi.');
        }
    }

    /**
     * Mengubah gambar menjadi tensor yang bisa dibaca oleh model.
     * @param {HTMLImageElement} imageElement - Elemen gambar yang akan diproses.
     * @returns {tf.Tensor}
     */
    preprocessImage(imageElement) {
        // 1. Ubah gambar menjadi tensor
        const tensor = tf.browser.fromPixels(imageElement)
            // 2. Resize ke ukuran yang diharapkan model (misal: 150x150)
            .resizeNearestNeighbor([IMAGE_SIZE, IMAGE_SIZE])
            // 3. Normalisasi nilai piksel dari 0-255 menjadi 0-1
            .toFloat()
            .div(tf.scalar(255.0))
            // 4. Tambahkan dimensi batch
            .expandDims();
        return tensor;
    }

    /**
     * Mengirim data gambar untuk diklasifikasi oleh model yang sudah dimuat.
     * @param {string} imageSrc - Data gambar dalam format base64 data URL.
     * @returns {Promise<object>} Objek hasil klasifikasi.
     */
    async classifyImage(imageSrc) {
        // Pastikan model sudah siap
        await this.loadModel();

        return new Promise((resolve, reject) => {
            const imageElement = new Image();
            imageElement.src = imageSrc;

            imageElement.onload = async () => {
                try {
                    // 1. Preprocess gambar
                    const tensor = this.preprocessImage(imageElement);
                    
                    // 2. Lakukan prediksi
                    const predictions = await this.model.predict(tensor).data();
                    
                    // 3. Dapatkan hasil prediksi (berupa array probabilitas)
                    // Karena output layer Anda sigmoid (1 neuron), hasilnya adalah satu angka antara 0 dan 1.
                    const confidence = predictions[0];
                    const predictedIndex = confidence < 0.5 ? 0 : 1;
                    const wasteType = CLASSES[predictedIndex];

                    console.log(`Hasil Prediksi: ${wasteType}, Skor Kepercayaan: ${confidence}`);

                    // 4. Bersihkan memori tensor
                    tensor.dispose();

                    // 5. Kembalikan hasil
                    resolve({
                        wasteType: wasteType,
                        confidence: confidence < 0.5 ? 1 - confidence : confidence,
                    });
                } catch (error) {
                    console.error('Error saat melakukan prediksi:', error);
                    reject(new Error('Gagal mengklasifikasi gambar.'));
                }
            };

            imageElement.onerror = () => {
                reject(new Error('Gagal memuat gambar untuk diproses.'));
            };
        });
    }
}

export default new ClassificationService();