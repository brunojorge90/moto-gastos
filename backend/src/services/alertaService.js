import { query } from '../db/index.js';
import { calcularKmAtual, calcularKmRestante, estimarDataProximaManutencao } from './kmService.js';

export const calcularStatusManutencoes = async (userId) => {
  const motoResult = await query('SELECT * FROM motos WHERE user_id = $1', [userId]);
  if (motoResult.rows.length === 0) {
    return { moto: null, statusList: [] };
  }

  const moto = motoResult.rows[0];
  const kmAtual = calcularKmAtual(moto);

  const tiposResult = await query(
    'SELECT * FROM tipos_manutencao WHERE user_id = $1 AND ativo = TRUE ORDER BY nome',
    [userId]
  );

  const alertasResult = await query(
    'SELECT * FROM config_alertas WHERE user_id = $1',
    [userId]
  );
  const alertasMap = {};
  alertasResult.rows.forEach((a) => {
    alertasMap[a.tipo_manutencao_id] = a;
  });

  const statusList = [];

  for (const tipo of tiposResult.rows) {
    const ultimaResult = await query(
      `SELECT * FROM manutencoes_realizadas
       WHERE user_id = $1 AND tipo_manutencao_id = $2
       ORDER BY km_no_momento DESC
       LIMIT 1`,
      [userId, tipo.id]
    );

    const ultima = ultimaResult.rows[0] || null;
    const kmUltima = ultima ? parseFloat(ultima.km_no_momento) : 0;
    const kmRestante = calcularKmRestante(kmAtual, kmUltima, tipo.intervalo_km);
    const kmProxima = kmUltima + parseFloat(tipo.intervalo_km);
    const dataEstimada = estimarDataProximaManutencao(kmRestante, moto.media_diaria_km);

    const alertaConfig = alertasMap[tipo.id] || null;
    const kmAntecedencia = alertaConfig ? parseFloat(alertaConfig.km_antecedencia) : 300;
    const notificacaoAtiva = alertaConfig ? alertaConfig.notificacao_ativa : true;

    const alertaAtivo = kmRestante <= kmAntecedencia;
    const vencida = kmRestante <= 0;

    statusList.push({
      tipo: {
        id: tipo.id,
        nome: tipo.nome,
        intervalo_km: parseFloat(tipo.intervalo_km),
      },
      ultimaManutencao: ultima
        ? {
            id: ultima.id,
            data_realizacao: ultima.data_realizacao,
            km_no_momento: parseFloat(ultima.km_no_momento),
            valor_gasto: parseFloat(ultima.valor_gasto),
          }
        : null,
      km_proxima: Math.round(kmProxima * 100) / 100,
      km_restante: kmRestante,
      data_estimada: dataEstimada,
      alerta_ativo: alertaAtivo,
      vencida,
      km_antecedencia: kmAntecedencia,
      notificacao_ativa: notificacaoAtiva,
    });
  }

  return { moto, kmAtual, statusList };
};
