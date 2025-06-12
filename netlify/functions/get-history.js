import { getStore } from "@netlify/blobs";
import { auth } from "@netlify/functions"; // ✅ Import helper auth Netlify

export const handler = async (event, context) => {
    const { user } = auth(context); // ✅ Ambil user dari JWT Authorization Bearer token

    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Akses ditolak. Anda harus login." }),
        };
    }

    try {
        const historyStore = getStore("scan_history");
        const userHistoryKey = `history-${user.sub}`;

        const userHistory = await historyStore.get(userHistoryKey, { type: "json" }) || [];

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
