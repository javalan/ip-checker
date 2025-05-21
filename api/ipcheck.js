export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL parameter');
  }

  // Get IP address from headers or connection
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  console.log('Client IP:', ip);

  // Get browser language header
  const lang = req.headers['accept-language'] || 'en';
  console.log('Client Language:', lang);

  let geoData;
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    geoData = await geoRes.json();
    console.log('Geo Data:', geoData);
  } catch (error) {
    console.error('Error fetching geo data:', error);
    // On error fetching geo data, just redirect safely
    res.writeHead(302, { Location: url });
    return res.end();
  }

  if (geoData && geoData.country === 'China') {
    const popupMessage = lang.startsWith('zh') || lang.startsWith('ja')
      ? '请先打开VIP然后点击“好”'
      : 'Please turn on VIP first and click OK';

    console.log('Showing VIP popup for China IP');

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
