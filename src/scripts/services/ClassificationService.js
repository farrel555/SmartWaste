// src/scripts/services/ClassificationService.js (Versi Perbaikan Final)

import * as tf from '@tensorflow/tfjs';

const MODEL_URL = '/tfjs_model/model.json';
const IMAGE_SIZE = 224; // DIUBAH: Sesuaikan dengan input shape model Anda (224x224)
const CLASSES = ['Non_Organik', 'Organik'];

class ClassificationService {
    constructor() {
        this.model = null;
    }

    async loadModel() {
        if (this.model) {
            return;
        }
        try {
            console.log('Memuat model...');
            // DIUBAH: Gunakan loadLayersModel, bukan loadGraphModel
            this.model = await tf.loadLayersModel(MODEL_URL);
            console.log('Model berhasil dimuat.');
        } catch (error) {
            console.error('Gagal memuat model:', error);
            throw new Error('Gagal mempersiapkan model klasifikasi.');
        }
    }

    preprocessImage(imageElement) {
        const tensor = tf.browser.fromPixels(imageElement)
            // DIUBAH: Sesuaikan ukuran resize dengan model Anda
            .resizeNearestNeighbor([IMAGE_SIZE, IMAGE_SIZE])
            .toFloat()
            .div(tf.scalar(255.0))
            .expandDims();
        return tensor;
    }

    async classifyImage(imageSrc) {
        await this.loadModel();

        return new Promise((resolve, reject) => {
            const imageElement = new Image();
            imageElement.src = imageSrc;
            imageElement.crossOrigin = "anonymous"; // Tambahkan ini untuk menghindari error CORS

            imageElement.onload = async () => {
                try {
                    const tensor = this.preprocessImage(imageElement);
                    const predictions = await this.model.predict(tensor).data();
                    
                    const confidence = predictions[0];
                    const predictedIndex = confidence < 0.5 ? 0 : 1;
                    const wasteType = CLASSES[predictedIndex];

                    console.log(`Hasil Prediksi: ${wasteType}, Skor Kepercayaan: ${confidence}`);

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