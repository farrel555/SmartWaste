# app/main.py

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import datetime
from datetime import timezone
import httpx
import base64

# Impor untuk Database dan Pydantic
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

# --- Konfigurasi Database Neon/PostgreSQL ---
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Model Tabel Database ---
class ScanHistory(Base):
    __tablename__ = "scan_history"
    id = Column(Integer, primary_key=True, index=True)
    imageUrl = Column(String)
    wasteType = Column(String, index=True)
    timestamp = Column(DateTime)
    # Anda bisa menambahkan user_id di sini di masa depan

# --- Pydantic Model ---
class ScanData(BaseModel):
    imageUrl: str
    wasteType: str

# --- Membuat tabel di database ---
Base.metadata.create_all(bind=engine)

# --- Dependency untuk Database Session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Inisialisasi Aplikasi FastAPI ---
app = FastAPI(title="SmartWaste API Lengkap")
origins = ["https://smartwastee.netlify.app", "http://localhost:8080"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Memuat Model ML ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml_models', 'model_sampah.h5')
model = tf.keras.models.load_model(MODEL_PATH)

def preprocess_image(image_data: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_data)).resize((224, 224))
    image_array = tf.keras.preprocessing.image.img_to_array(image)
    if image_array.shape[-1] == 4:
        image_array = image_array[..., :3]
    return np.expand_dims(image_array, axis=0) / 255.0

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Selamat datang di SmartWaste API"}

@app.post("/predict", summary="Prediksi Jenis Sampah & Simpan Riwayat")
async def predict_waste(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not model:
        raise HTTPException(status_code=500, detail="Model tidak tersedia.")
    try:
        image_data = await file.read()
        processed_image = preprocess_image(image_data)
        prediction = model.predict(processed_image)
        confidence = prediction[0][0]
        predicted_class = 'Organik' if confidence >= 0.5 else 'Non_Organik'

        image_as_base64 = f"data:{file.content_type};base64,{base64.b64encode(image_data).decode('utf-8')}"
        new_history = ScanHistory(
            imageUrl=image_as_base64,
            wasteType=predicted_class,
            timestamp=datetime.datetime.now(timezone.utc)
        )
        db.add(new_history)
        db.commit()

        return {"wasteType": predicted_class, "confidence": float(confidence)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Terjadi error saat prediksi/simpan riwayat: {str(e)}")

@app.get("/history", summary="Ambil Semua Riwayat Scan")
def get_history(db: Session = Depends(get_db)):
    return db.query(ScanHistory).order_by(ScanHistory.timestamp.desc()).all()

@app.get("/waste-banks", summary="Cari Bank Sampah Terdekat")
async def get_waste_banks(lat: float, lon: float):
    radius = 0.05
    bbox = f"{lat - radius},{lon - radius},{lat + radius},{lon + radius}"
    overpass_query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="recycling"]({bbox});
          way["amenity"="recycling"]({bbox});
          relation["amenity"="recycling"]({bbox});
        );
        out center;
    """
    overpass_url = "https://overpass-api.de/api/interpreter"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(overpass_url, data=overpass_query)
            response.raise_for_status()
            data = response.json()
        
        locations = []
        for el in data.get("elements", []):
            tags = el.get("tags", {})
            if tags:
                center = el.get("center", {})
                location_lat = el.get("lat") or center.get("lat")
                location_lon = el.get("lon") or center.get("lon")
                if location_lat and location_lon:
                    locations.append({
                        "name": tags.get("name", "Tempat Daur Ulang"),
                        "address": tags.get("addr:full") or tags.get("addr:street") or "Alamat tidak tersedia",
                        "lat": location_lat,
                        "lon": location_lon,
                    })
        return locations
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Gagal menghubungi layanan peta: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi error internal saat mencari bank sampah: {str(e)}")