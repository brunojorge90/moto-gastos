import fetch from 'node-fetch';

/**
 * Dispara um webhook no N8N com os alertas pendentes.
 * O N8N pode usar esses dados para enviar notificações (e-mail, Telegram, etc).
 */
export const dispararAlertasN8n = async (webhookUrl, payload) => {
  if (!webhookUrl) {
    console.warn('WEBHOOK_N8N_URL não configurado, pulando disparo.');
    return null;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Webhook N8N falhou: ${response.status} - ${text}`);
      return null;
    }

    const data = await response.json().catch(() => ({ ok: true }));
    return data;
  } catch (err) {
    console.error('Erro ao disparar webhook N8N:', err.message);
    return null;
  }
};
