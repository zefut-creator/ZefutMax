/**
 * Safely proxies a Telegram gift sticker file without exposing the bot token.
 * Usage: /api/gift-image?file_id=<Telegram sticker file_id>
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method not allowed');
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const fileId = typeof req.query.file_id === 'string' ? req.query.file_id : '';
  if (!token) return res.status(503).end('Telegram bot is not configured');
  if (!fileId || fileId.length > 1024) return res.status(400).end('Missing or invalid file_id');

  try {
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`
    );
    const info = await infoResponse.json();
    const filePath = info?.result?.file_path;
    if (!infoResponse.ok || !info.ok || typeof filePath !== 'string' ||
        filePath.includes('..') || filePath.startsWith('/')) {
      return res.status(502).end('Telegram file is unavailable');
    }

    const fileResponse = await fetch(
      `https://api.telegram.org/file/bot${token}/${filePath}`
    );
    if (!fileResponse.ok) return res.status(502).end('Could not load Telegram file');

    const ext = filePath.split('.').pop().toLowerCase();
    const types = {
      webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg',
      jpeg: 'image/jpeg', gif: 'image/gif', tgs: 'application/x-tgsticker',
      webm: 'video/webm'
    };
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const bytes = Buffer.from(await fileResponse.arrayBuffer());
    return res.status(200).send(bytes);
  } catch (error) {
    console.error('Telegram gift image proxy failed:', error);
    return res.status(502).end('Could not load Telegram file');
  }
};
