// utils/pushNotification.js

export async function initPushNotification() {
  if (!('serviceWorker' in navigator)) return;
  if (!('PushManager' in window)) return;

  const btnSubscribe = document.getElementById('btnSubscribe');
  if (!btnSubscribe) return; // tombol tidak ada

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // Update tombol sesuai status awal
    updateButton(subscription);

    // Event listener untuk toggle subscribe/unsubscribe
    btnSubscribe.addEventListener('click', async () => {
      if (subscription) {
        // Unsubscribe
        await subscription.unsubscribe();
        subscription = null;
        // Hapus subscription dari localStorage
        localStorage.removeItem('pushSubscription');
        updateButton(subscription);
        console.log('Push notification unsubscribed');
      } else {
        // Minta izin notifikasi dulu
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Izin notifikasi ditolak.');
          return;
        }

        // Subscribe
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
          ),
        });

        // Simpan subscription ke localStorage (bukan kirim ke backend)
        localStorage.setItem('pushSubscription', JSON.stringify(subscription));

        updateButton(subscription);
        console.log('Push notification subscribed:', subscription);
      }
    });
  } catch (error) {
    console.error('Gagal inisialisasi push notification:', error);
  }
}

function updateButton(subscription) {
  const btn = document.getElementById('btnSubscribe');
  if (!btn) return;
  if (subscription) {
    btn.textContent = 'Subscribed';
    btn.classList.add('subscribed');
    btn.setAttribute('aria-pressed', 'true');
  } else {
    btn.textContent = 'Subscribe';
    btn.classList.remove('subscribed');
    btn.setAttribute('aria-pressed', 'false');
  }
}

// Helper untuk convert VAPID key base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
