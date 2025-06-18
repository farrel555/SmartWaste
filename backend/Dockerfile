# Gunakan base image resmi dari Python
FROM python:3.11-slim

# Set direktori kerja di dalam container
WORKDIR /code

# Salin file requirements terlebih dahulu untuk caching yang lebih baik
COPY ./requirements.txt /code/requirements.txt

# Instal semua dependensi Python
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Salin seluruh isi folder app (termasuk model .h5) ke dalam container
COPY ./app /code/app

# Perintah yang akan dijalankan saat container dimulai
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]