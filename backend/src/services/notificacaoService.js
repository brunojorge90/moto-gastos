import { query } from '../db/index.js';
import { calcularStatusManutencoes } from './alertaService.js';
import { enviarMensagemTelegram } from './telegramService.js';

const formatarMensagem = (motoApelido, statusItem, kmAtual) => {
  const nome = statusItem.tipo.nome;
  const restante = Math.max(0, Math.round(statusItem.km_restante));
  const intervalo = Math.round(statusItem.tipo.intervalo_km);
  const proxima = Math.round(statusItem.km_proxima);
  const moto = motoApelido || 'sua moto';

  if (statusItem.vencida) {
    return (
      `🚨 <b>${nome}</b> — VENCIDA\n` +
      `Moto: ${moto}\n` +
      `KM atual: ${Math.round(kmAtual)}\n` +
      `Deveria ter sido feita aos ${proxima} km.`
    );
  }

  return (
    `🔧 <b>${nome}</b>\n` +
    `Moto: ${moto}\n` +
    `Faltam <b>${restante} km</b> (intervalo de ${intervalo} km).\n` +
    `KM atual: ${Math.round(kmAtual)} • próxima troca aos ${proxima} km.`
  );
};

/**
 * Varre todos os usuários com chat_id configurado, calcula status de manutenções
 * e envia mensagem no Telegram para alertas ativos ainda não notificados neste ciclo.
 */
export const processarNotificacoesPendentes = async () => {
  const usuarios = await query(
    "SELECT id, email, telegram_chat_id FROM users WHERE telegram_chat_id IS NOT NULL AND telegram_chat_id <> ''"
  );

  let enviadas = 0;
  let erros = 0;

  for (const user of usuarios.rows) {
    try {
      const { moto, kmAtual, statusList } = await calcularStatusManutencoes(user.id);
      if (!moto) continue;

      const alertasResult = await query(
        'SELECT tipo_manutencao_id, last_notificado_at, notificacao_ativa FROM config_alertas WHERE user_id = $1',
        [user.id]
      );
      const alertasMap = {};
      alertasResult.rows.forEach((a) => {
        alertasMap[a.tipo_manutencao_id] = a;
      });

      for (const item of statusList) {
        if (!item.alerta_ativo) continue;
        if (!item.notificacao_ativa) continue;

        const cfg = alertasMap[item.tipo.id];
        if (cfg && cfg.last_notificado_at) continue; // já notificado neste ciclo

        const texto = formatarMensagem(moto.apelido, item, kmAtual);
        try {
          await enviarMensagemTelegram(user.telegram_chat_id, texto);
          await query(
            "UPDATE config_alertas SET last_notificado_at = datetime('now') WHERE user_id = $1 AND tipo_manutencao_id = $2",
            [user.id, item.tipo.id]
          );
          enviadas += 1;
        } catch (err) {
          erros += 1;
          console.error(`[notificacao] Falha ao notificar user ${user.email}, tipo ${item.tipo.nome}:`, err.message);
        }
      }
    } catch (err) {
      erros += 1;
      console.error(`[notificacao] Erro processando user ${user.email}:`, err.message);
    }
  }

  return { enviadas, erros, totalUsuarios: usuarios.rows.length };
};
