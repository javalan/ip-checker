export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL');
  }

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('Client IP:', ip);

  const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
  const geoData = await geoRes.json();

  console.log('Geo Data:', geoData);

  if (geoData.country === 'China') {
    console.log('Showing VIP popup for China IP');

    const lang = req.headers['accept-language'] || 'en';
    const popupMessage = lang.startsWith('zh') || lang.startsWith('ja')
      ? '请先打开VIP然后点击“好”'
      : 'Please turn on VIP first and click OK';

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>VIP Required</title>
        <script>
          if (confirm(${JSON.stringify(popupMessage)})) {
            window.location.reload();
          } else {
            window.stop();
          }
        </script>
      </head>
      <body style="background-color: black;"></body>
      </html>
    `);
  } else {
    console.log('Redirecting to target URL:', url);
    res.writeHead(302, { Location: url });
    res.end();
  }
}
