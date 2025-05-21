export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL');
  }

  // Get client IP from x-forwarded-for or connection
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.connection.remoteAddress;
  const lang = req.headers['accept-language'] || 'en';

  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoRes.json();

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
        <body style="background-color: black;">
          <script>
            if (confirm(${JSON.stringify(popupMessage)})) {
              window.location.reload();
            } else {
              // Optionally, redirect away or do nothing
              // window.location.href = 'https://example.com';
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
    // On error (e.g., geo API down), redirect anyway
    res.writeHead(302, { Location: url });
    return res.end();
  }
}
