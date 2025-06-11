import tensorflow as tf
import numpy as np
from PIL import Image
import base64
import io
import json

# Muat model HANYA SEKALI saat fungsi pertama kali diinisialisasi
# Path ini relatif terhadap file fungsi
model = tf.keras.models.load_model('./model_sampah.h5') 

def handler(event, context):
    try:
        # Ambil data gambar base64 dari request body
        body = json.loads(event['body'])
        image_data = body['image']

        # Hapus header base64
        image_data = image_data.split(',')[1]

        # Decode gambar dan lakukan preprocessing
        img = Image.open(io.BytesIO(base64.b64decode(image_data))).resize((224, 224))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        # Lakukan prediksi
        prediction = model.predict(img_array)
        confidence = prediction[0][0]

        # Tentukan kelas berdasarkan nilai confidence
        result = 'Organik' if confidence > 0.5 else 'Non_Organik'

        return {
            'statusCode': 200,
            'body': json.stringify({'wasteType': result, 'confidence': float(confidence)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.stringify({'message': str(e)})
        }