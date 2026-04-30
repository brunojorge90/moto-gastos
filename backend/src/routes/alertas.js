import { Router } from 'express';
import { query } from '../db/index.js';
import authMiddleware from '../middleware/auth.js';
import { enviarMensagemTelegram } from '../services/telegramService.js';
import { processarNotificacoesPendentes } from '../services/notificacaoService.js';
import { calcularStatusManutencoes } from '../services/alertaService.js';

const router = Router();
router.use(authMiddleware);

// GET /alertas/telegram
router.get('/telegram', async (req, res, next) => {
  try {
    const result = await query('SELECT telegram_chat_id FROM users WHERE id = $1', [req.userId]);
    res.json({ chat_id: result.rows[0]?.telegram_chat_id || null });
  } catch (err) {
    next(err);
  }
});

// PUT /alertas/telegram  body: { chat_id }
router.put('/telegram', async (req, res, next) => {
  try {
    const { chat_id } = req.body;
    const value = chat_id ? String(chat_id).trim() : null;
    await query('UPDATE users SET telegram_chat_id = $1 WHERE id = $2', [value, req.userId]);
    res.json({ chat_id: value });
  } catch (err) {
    next(err);
  }
});

// POST /alertas/telegram/test
router.post('/telegram/test', async (req, res, next) => {
  try {
    const result = await query('SELECT telegram_chat_id FROM users WHERE id = $1', [req.userId]);
    const chatId = result.rows[0]?.telegram_chat_id;
    if (!chatId) {
      return res.status(400).json({ error: 'chat_id não configurado' });
    }
    await enviarMensagemTelegram(
      chatId,
      '✅ <b>Moto Gastos</b>\nMensagem de teste recebida com sucesso! Seu Telegram está conectado.'
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// POST /alertas/telegram/relatorio — envia resumo completo (todos os tipos) sob demanda
router.post('/telegram/relatorio', async (req, res) => {
  try {
    const userResult = await query('SELECT telegram_chat_id FROM users WHERE id = $1', [req.userId]);
    const chatId = userResult.rows[0]?.telegram_chat_id;
    if (!chatId) {
      return res.status(400).json({ error: 'Cadastre seu chat_id do Telegram primeiro.' });
    }

    const { moto, kmAtual, statusList } = await calcularStatusManutencoes(req.userId);
    if (!moto) {
      return res.status(400).json({ error: 'Cadastre sua moto primeiro.' });
    }

    const vencidas = statusList.filter((s) => s.vencida);
    const alertas = statusList.filter((s) => s.alerta_ativo && !s.vencida);
    const okList = statusList.filter((s) => !s.alerta_ativo && !s.vencida);

    const linhas = [];
    const nomeMoto = moto.apelido || moto.modelo || 'sua moto';
    linhas.push(`🏍 <b>${nomeMoto}</b> — ${Math.round(kmAtual)} km`);
    linhas.push(`Média: ${parseFloat(moto.media_diaria_km)} km/dia`);
    linhas.push('');

    if (vencidas.length) {
      linhas.push('❌ <b>Vencidas</b>');
      vencidas.forEach((s) => {
        const atraso = Math.abs(Math.round(s.km_restante));
        linhas.push(`• ${s.tipo.nome} — ${atraso} km atrás`);
      });
      linhas.push('');
    }

    if (alertas.length) {
      linhas.push('⚠️ <b>Alerta</b>');
      alertas.forEach((s) => {
        linhas.push(`• ${s.tipo.nome} — faltam ${Math.round(s.km_restante)} km`);
      });
      linhas.push('');
    }

    if (okList.length) {
      linhas.push('✅ <b>OK</b>');
      okList.forEach((s) => {
        linhas.push(`• ${s.tipo.nome} — faltam ${Math.round(s.km_restante)} km`);
      });
    }

    if (!vencidas.length && !alertas.length && !okList.length) {
      linhas.push('Nenhum tipo de manutenção cadastrado.');
    }

    await enviarMensagemTelegram(chatId, linhas.join('\n'));
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// POST /alertas/notificar-agora — força execução do job (útil para testar fora do horário do cron)
router.post('/notificar-agora', async (req, res, next) => {
  try {
    const r = await processarNotificacoesPendentes();
    res.json(r);
  } catch (err) {
    next(err);
  }
});

// GET /alertas/config
router.get('/config', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ca.*, tm.nome as tipo_nome, tm.intervalo_km
       FROM config_alertas ca
       JOIN tipos_manutencao tm ON ca.tipo_manutencao_id = tm.id
       WHERE ca.user_id = $1
       ORDER BY tm.nome`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PUT /alertas/config/:tipo_manutencao_id
router.put('/config/:tipo_manutencao_id', async (req, res, next) => {
  try {
    const { tipo_manutencao_id } = req.params;
    const { km_antecedencia, notificacao_ativa } = req.body;

    if (km_antecedencia === undefined) {
      return res.status(400).json({ error: 'km_antecedencia é obrigatório' });
    }

    if (parseFloat(km_antecedencia) < 0) {
      return res.status(400).json({ error: 'km_antecedencia deve ser maior ou igual a zero' });
    }

    const tipoCheck = await query(
      'SELECT id FROM tipos_manutencao WHERE id = $1 AND user_id = $2',
      [tipo_manutencao_id, req.userId]
    );
    if (tipoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de manutenção não encontrado' });
    }

    const result = await query(
      `INSERT INTO config_alertas (user_id, tipo_manutencao_id, km_antecedencia, notificacao_ativa)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, tipo_manutencao_id)
       DO UPDATE SET km_antecedencia = excluded.km_antecedencia, notificacao_ativa = excluded.notificacao_ativa
       RETURNING *`,
      [req.userId, tipo_manutencao_id, km_antecedencia, notificacao_ativa !== undefined ? notificacao_ativa : true]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
