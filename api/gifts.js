/**
 * ZefutMax live Telegram gift catalog.
 * Set TELEGRAM_BOT_TOKEN in Vercel Project Settings → Environment Variables.
 * This endpoint exposes only public catalog data; never return the bot token.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(503).json({
      error: 'Telegram bot is not configured',
      setup: 'Add TELEGRAM_BOT_TOKEN in Vercel Environment Variables, then redeploy.'
    });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getAvailableGifts`);
    const data = await response.json();

    if (!response.ok || !data.ok || !Array.isArray(data.result?.gifts)) {
      console.error('Telegram getAvailableGifts failed:', data.description || response.status);
      return res.status(502).json({ error: 'Telegram gift catalog is temporarily unavailable' });
    }

    const gifts = data.result.gifts.map(gift => ({
      id: String(gift.id),
      stars: Number(gift.star_count),
      stickerFileId: gift.sticker?.file_id || null,
      thumbnailFileId: gift.sticker?.thumbnail?.file_id || null,
      previewFileId: gift.sticker?.thumbnail?.file_id || null,
      stickerEmoji: gift.sticker?.emoji || null,
      stickerType: gift.sticker?.is_animated ? 'animated' :
        gift.sticker?.is_video ? 'video' : 'static',
      premiumOnly: Boolean(gift.is_premium),
      totalCount: Number.isFinite(gift.total_count) ? gift.total_count : null,
      remainingCount: Number.isFinite(gift.remaining_count) ? gift.remaining_count : null,
      upgradeStars: Number.isFinite(gift.upgrade_star_count) ? gift.upgrade_star_count : null
    }));

    return res.status(200).json({
      source: 'Telegram Bot API getAvailableGifts',
      updatedAt: new Date().toISOString(),
      count: gifts.length,
      gifts
    });
  } catch (error) {
    console.error('Telegram gift catalog request failed:', error);
    return res.status(502).json({ error: 'Could not reach Telegram right now' });
  }
};
