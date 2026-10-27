# ZefutMax

ZefutMax is a Telegram Gifts market UI. The current client-side balance and buy/sell actions are a demo and do not move real gifts or money.

## Live Telegram gift catalog API

The Vercel serverless endpoint `GET /api/gifts` reads the currently available gift list from Telegram's official Bot API `getAvailableGifts`. It returns gift IDs, prices in Telegram Stars, limited-availability counts when supplied, and sticker file IDs.

### Setup

1. Open the ZefutMax project in Vercel.
2. Go to **Settings → Environment Variables**.
3. Add `TELEGRAM_BOT_TOKEN` with the token from BotFather. Keep it private; never place it in frontend JavaScript or commit it to GitHub.
4. Enable it for the Production environment and redeploy.

Test the endpoint at `https://zefutmax.vercel.app/api/gifts`.

Sticker files can be fetched through `GET /api/gift-image?file_id=...`, which proxies the file so the bot token stays server-side. Telegram stickers may be static WebP/PNG, animated TGS, or video WebM; a browser may need a dedicated renderer for animated formats.

## Important limitations

- Telegram's official `getAvailableGifts` catalog is the list a bot can send, not a full secondary-market resale feed.
- Values are Telegram Stars, not GRAM, TON, or a guaranteed cash value.
- Real purchases, ownership tracking, transfers, and refunds require separate server-side order logic and the relevant Telegram capabilities. The demo balance is not a payment system.
