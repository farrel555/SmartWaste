import json
import base64
import io
import os
import tensorflow as tf
import numpy as np
from PIL import Image

# Muat model HANYA SEKALI saat fungsi pertama kali diinisialisasi
# Path ini relatif terhadap file fungsi ini
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model_sampah.h5')
model = tf.keras.models.load_model(MODEL_PATH)

# Fungsi untuk preprocessing gambar
def preprocess_image(image_data: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_data)).resize((224, 224))
    image_array = tf.keras.preprocessing.image.img_to_array(image)
    if image_array.shape[-1] == 4:
        image_array = image_array[..., :3]
    return np.expand_dims(image_array, axis=0) / 255.0

# Handler utama yang akan dieksekusi oleh Netlify
def handler(event, context):
    try:
        if event['httpMethod'] != 'POST':
            return {
                'statusCode': 405,
                'body': json.dumps({'message': 'Method Not Allowed'})
            }

        # Body dari request frontend biasanya dalam format base64
        body = json.loads(event['body'])
        image_b64 = body['image']

        # Hapus header base64 (misal, "data:image/jpeg;base64,")
        image_data = base64.b64decode(image_b64.split(',')[1])

        # Lakukan preprocessing dan prediksi
        processed_image = preprocess_image(image_data)
        prediction = model.predict(processed_image)
        confidence = prediction[0][0]
        
        # Model Anda memiliki 2 kelas: Non_Organik dan Organik
        predicted_class = 'Organik' if confidence >= 0.5 else 'Non_Organik'

        # Kembalikan hasil sebagai JSON
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'wasteType': predicted_class,
                'confidence': float(confidence)
            })
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f'Terjadi error internal: {str(e)}'})
        }