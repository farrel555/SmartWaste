// netlify/functions/get-history.js

import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
    // 1. Verifikasi Autentikasi Pengguna
    const { user } = context.netlifyContext;

    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Akses ditolak. Anda harus login." }),
        };
    }

    try {
        // 2. Siapkan pengambilan data
        const historyStore = getStore("scan_history");
        const userHistoryKey = `history-${user.sub}`;

        // 3. Ambil data dari Netlify Blobs
        // Jika tidak ada data, kembalikan array kosong
        const userHistory = await historyStore.get(userHistoryKey, { type: "json" }) || [];

        // 4. Kirim data riwayat sebagai respons
        return {
            statusCode: 200,
            body: JSON.stringify(userHistory),
        };

    } catch (error) {
        console.error("Error saat mengambil riwayat:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Terjadi kesalahan pada server." }),
        };
    }
};