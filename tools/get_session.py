"""
Одноразовый скрипт: выдаёт TELEGRAM_SESSION (строку сессии) для сервера.
Запускать у себя на компьютере. Результат НЕ отправляйте в чат и не коммитьте.

  pip install telethon
  python tools/get_session.py
"""
import getpass
from telethon.sync import TelegramClient
from telethon.sessions import StringSession

api_id = int(input("api_id: ").strip())
api_hash = getpass.getpass("api_hash (ввод скрыт): ").strip()

with TelegramClient(StringSession(), api_id, api_hash) as client:
    # Telethon сам спросит номер, код из Telegram и пароль 2FA (если включён)
    print("\nВаша TELEGRAM_SESSION (храните как пароль, только в Vercel):\n")
    print(client.session.save())
