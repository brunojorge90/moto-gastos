import fetch from 'node-fetch';

const TELEGRAM_API = 'https://api.telegram.org';

export const enviarMensagemTelegram = async (chatId, texto) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN não configurado no .env');
  }
  if (!chatId) {
    throw new Error('chat_id não informado');
  }

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: texto,
      parse_mode: 'HTML',
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    const desc = data.description || `HTTP ${response.status}`;
    throw new Error(`Telegram API: ${desc}`);
  }
  return data.result;
};
