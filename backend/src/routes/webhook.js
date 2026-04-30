import { Router } from 'express';
import { query } from '../db/index.js';
import { calcularKmAtual, calcularKmRestante } from '../services/kmService.js';

const router = Router();

// Middleware para verificar chave da API do webhook (usado pelo N8N)
const webhookAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).json({ error: 'Chave de API inválida' });
  }
  next();
};

// GET /webhook/alertas-pendentes
// Retorna todos os usuários com alertas ativos — consumido pelo N8N
router.get('/alertas-pendentes', webhookAuth, async (req, res, next) => {
  try {
    const usuariosResult = await query('SELECT id, email FROM users');
    const alertasPendentes = [];

    for (const user of usuariosResult.rows) {
      const motoResult = await query('SELECT * FROM motos WHERE user_id = $1', [user.id]);
      if (motoResult.rows.length === 0) continue;

      const moto = motoResult.rows[0];
      const kmAtual = calcularKmAtual(moto);

      const tiposResult = await query(
        'SELECT * FROM tipos_manutencao WHERE user_id = $1 AND ativo = TRUE',
        [user.id]
      );

      for (const tipo of tiposResult.rows) {
        const alertaResult = await query(
          'SELECT * FROM config_alertas WHERE user_id = $1 AND tipo_manutencao_id = $2',
          [user.id, tipo.id]
        );

        const alertaConfig = alertaResult.rows[0];
        if (!alertaConfig || !alertaConfig.notificacao_ativa) continue;

        const ultimaResult = await query(
          `SELECT * FROM manutencoes_realizadas
           WHERE user_id = $1 AND tipo_manutencao_id = $2
           ORDER BY km_no_momento DESC LIMIT 1`,
          [user.id, tipo.id]
        );

        const ultima = ultimaResult.rows[0];
        // Sem histórico: baseline é km_inicial (importante para motos usadas).
        const kmUltima = ultima ? parseFloat(ultima.km_no_momento) : parseFloat(moto.km_inicial);
        const kmRestante = calcularKmRestante(kmAtual, kmUltima, tipo.intervalo_km);

        if (kmRestante <= parseFloat(alertaConfig.km_antecedencia)) {
          alertasPendentes.push({
            usuario: { id: user.id, email: user.email },
            moto: {
              apelido: moto.apelido,
              modelo: moto.modelo,
              km_atual: kmAtual,
            },
            manutencao: {
              tipo: tipo.nome,
              km_restante: kmRestante,
              vencida: kmRestante <= 0,
            },
          });
        }
      }
    }

    res.json({
      total: alertasPendentes.length,
      alertas: alertasPendentes,
      gerado_em: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
