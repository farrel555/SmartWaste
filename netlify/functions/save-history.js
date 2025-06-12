// netlify/functions/save-history.js

import { getStore } from "@netlify/blobs";
import { auth } from "@netlify/functions"; // ✅ Import helper auth Netlify

export const handler = async (event, context) => {
  const { user } = auth(context); // ✅ Ambil user dari token Bearer

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Akses ditolak. Anda harus login." }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const historyStore = getStore("scan_history");
    const userHistoryKey = `history-${user.sub}`;

    const existingHistory = await historyStore.get(userHistoryKey, { type: "json" }) || [];
    existingHistory.unshift({
      ...body,
      timestamp: new Date().toISOString(),
    });

    await historyStore.set(userHistoryKey, existingHistory, { type: "json" });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Riwayat berhasil disimpan." }),
    };

  } catch (error) {
    console.error("Error saat menyimpan riwayat:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Gagal menyimpan riwayat." }),
    };
  }
};
