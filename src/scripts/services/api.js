export async function getWasteReports() {
    try {
        // Ganti dengan endpoint API Anda yang sebenarnya
        const response = await fetch('/api/waste-reports');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Gagal mengambil laporan limbah:", error);
        return [];
    }
}

export async function submitWasteReport(reportData) {
    try {
        const response = await fetch('/api/waste-reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Gagal mengirim laporan limbah:", error);
        return null;
    }
}