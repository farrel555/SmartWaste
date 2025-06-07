import express from 'express';
import webpush from 'web-push';

const app = express();
app.use(express.json());

const subscriptions = [];

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  'PUBLIC_VAPID_KEY',
  'PRIVATE_VAPID_KEY'
);

app.post('/save-subscription', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Subscription saved.' });
});

app.post('/stories', async (req, res) => {
  const { title } = req.body;
  // Simpan cerita di DB (skip di contoh ini)

  // Kirim push ke semua subscription
  const payload = JSON.stringify({
    title: 'Cerita baru!',
    body: `Ada cerita baru berjudul: ${title}`,
  });

  const sendPromises = subscriptions.map(sub =>
    webpush.sendNotification(sub, payload).catch(err => {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription sudah tidak valid, hapus
        subscriptions = subscriptions.filter(s => s !== sub);
      }
    })
  );

  await Promise.all(sendPromises);

  res.status(201).json({ message: 'Cerita dibuat dan notifikasi dikirim.' });
});

app.listen(3000);
