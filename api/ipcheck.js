export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL');
  }

  // Extract IP from x-forwarded-for or connection
  const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ip = rawIp ? rawIp.split(',')[0].trim() : null;
  const lang = req.headers['accept-language'] || 'en';

  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoRes.json();

    // DEBUG: show detected IP and country
    console.log('Detected IP:', ip);
    console.log('Geo Data:', geoData);

    // For debugging: send info back in HTML (remove later)
    if (!geoData || !geoData.country) {
      return res.status(500).send(`Could not determine country for IP: ${ip}`);
    }

    if (geoData.country === 'China') {
      const popupMessage = lang.startsWith('zh') || lang.startsWith('ja')
        ? '请先打开VIP然后点击“好”'
        : 'Please turn on VIP first and click OK';

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>VIP Required</title>
        </head>
        <body style="background-color: black; color: white;">
          <p>Detected IP: ${ip}</p>
          <p>Country: ${geoData.country}</p>
          <script>
            if (confirm(${JSON.stringify(popupMessage)})) {
              window.location.reload();
            } else {
              // Optionally redirect or stop
              window.stop();
            }
          </script>
        </body>
        </html>
      `);
    } else {
      // Safe to redirect
      res.writeHead(302, { Location: url });
      return res.end();
    }
  } catch (error) {
    console.error('Geo lookup failed:', error);

    // On error, just redirect to url
    res.writeHead(302, { Location: url });
    return res.end();
  }
}
