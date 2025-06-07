/**
 * Fungsi untuk memformat tanggal sesuai dengan locale dan opsi.
 * @param {string} date - Tanggal yang ingin diformat.
 * @param {string} [locale='en-US'] - Locale untuk format tanggal (misalnya: 'id-ID', 'en-US').
 * @param {Object} [options={}] - Opsi tambahan untuk format tanggal.
 * @returns {string} - Tanggal yang sudah diformat sesuai dengan locale dan opsi.
 */
export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Fungsi untuk menunggu dalam waktu tertentu (delay).
 * @param {number} [time=1000] - Waktu tunggu dalam milidetik (default 1000ms).
 * @returns {Promise} - Promise yang akan resolve setelah waktu tunggu selesai.
 */
export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
