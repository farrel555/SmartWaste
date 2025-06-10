// src/scripts/services/ClassificationService.js

import * as tf from '@tensorflow/tfjs';

// Path ke model Anda di folder public
const MODEL_URL = '/tfjs_model/model.json'; 
// Ukuran input gambar sesuai dengan yang Anda gunakan saat training (224x224)
const IMAGE_SIZE = 224; 
// Kelas klasifikasi Anda, sesuai dengan README.md
const CLASSES = ['Non_Organik', 'Organik'];

class ClassificationService {
    constructor() {
        this.model = null;
    }

    /**
     * Memuat model TensorFlow.js. Hanya dijalankan sekali.
     */
    async loadModel() {
        if (this.model) {
            return;
        }
        try {
            console.log('Memuat model dari:', MODEL_URL);
            // DIUBAH: Gunakan loadLayersModel sesuai format model.json Anda
            this.model = await tf.loadLayersModel(MODEL_URL);
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
        const tensor = tf.browser.fromPixels(imageElement)
            .resizeNearestNeighbor([IMAGE_SIZE, IMAGE_SIZE])
            .toFloat()
            .div(tf.scalar(255.0))
            .expandDims();
        return tensor;
    }

    /**
     * Mengirim data gambar untuk diklasifikasi oleh model yang sudah dimuat.
     * @param {string} imageSrc - Data gambar dalam format base64 data URL.
     * @returns {Promise<object>} Objek hasil klasifikasi.
     */
    async classifyImage(imageSrc) {
        await this.loadModel();

        return new Promise((resolve, reject) => {
            const imageElement = new Image();
            imageElement.src = imageSrc;
            imageElement.crossOrigin = "anonymous"; // Praktik terbaik untuk mencegah error CORS

            imageElement.onload = async () => {
                try {
                    const tensor = this.preprocessImage(imageElement);
                    // Lakukan prediksi
                    const predictions = await this.model.predict(tensor).data();
                    
                    // Interpretasikan hasil dari output layer sigmoid (1 neuron)
                    const confidence = predictions[0];
                    const predictedIndex = confidence < 0.5 ? 0 : 1; // 0 untuk Non_Organik, 1 untuk Organik
                    const wasteType = CLASSES[predictedIndex];

                    console.log(`Hasil Prediksi: ${wasteType}, Skor Kepercayaan: ${confidence}`);

                    // Bersihkan memori tensor untuk mencegah memory leak
                    tensor.dispose();

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