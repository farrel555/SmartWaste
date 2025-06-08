import AuthService from './AuthService';

class HistoryService {
    /**
     * Menyimpan satu data hasil scan ke backend.
     * @param {object} scanData - Data yang akan disimpan, contoh: { imageUrl, wasteType, timestamp }.
     * @returns {Promise<object>}
     */
    async saveScanHistory(scanData) {
        const user = AuthService.getCurrentUser();
        if (!user) {
            return Promise.reject(new Error('Pengguna tidak terautentikasi.'));
        }

        // Netlify Identity secara otomatis menyediakan token di context.clientContext
        // jadi kita hanya perlu memanggil function-nya.
        try {
            const response = await fetch('/.netlify/functions/save-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token.access_token}`
                },
                body: JSON.stringify(scanData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menyimpan riwayat.');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in saveScanHistory:', error);
            throw error;
        }
    }

    /**
     * Mengambil seluruh riwayat scan untuk pengguna yang sedang login.
     * @returns {Promise<Array>}
     */
    async getScanHistory() {
        const user = AuthService.getCurrentUser();
        if (!user) {
            return Promise.reject(new Error('Pengguna tidak terautentikasi.'));
        }
        
        try {
            const response = await fetch('/.netlify/functions/get-history', {
                headers: {
                    'Authorization': `Bearer ${user.token.access_token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil riwayat.');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getScanHistory:', error);
            throw error;
        }
    }
}

export default new HistoryService();