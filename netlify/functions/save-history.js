// netlify/functions/save-history.js

import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
    // 1. Verifikasi Autentikasi Pengguna
    // Netlify secara otomatis menyediakan info user jika ada token yang valid.
    const { user } = context.netlifyContext;

    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Akses ditolak. Anda harus login." }),
        };
    }

    try {
        // 2. Ambil data scan dari body request
        const scanData = JSON.parse(event.body);
        if (!scanData || !scanData.wasteType || !scanData.imageUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Data yang dikirim tidak lengkap." }),
            };
        }

        // 3. Siapkan data untuk disimpan
        // Dapatkan 'store' yang sudah kita buat di UI Netlify
        const historyStore = getStore("scan_history");
        // Buat kunci unik untuk setiap pengguna berdasarkan ID-nya
        const userHistoryKey = `history-${user.sub}`; // 'sub' adalah ID unik pengguna

        // 4. Pola Read-Modify-Write
        // Ambil riwayat yang sudah ada (jika ada)
        const existingHistory = await historyStore.get(userHistoryKey, { type: "json" }) || [];

        // Tambahkan data scan baru ke dalam array riwayat
        const updatedHistory = [...existingHistory, scanData];

        // Simpan kembali seluruh array riwayat yang sudah diperbarui
        await historyStore.setJSON(userHistoryKey, updatedHistory);

        // 5. Kirim respons sukses
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Riwayat berhasil disimpan", data: scanData }),
        };

    } catch (error) {
        console.error("Error saat menyimpan riwayat:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Terjadi kesalahan pada server." }),
        };
    }
};