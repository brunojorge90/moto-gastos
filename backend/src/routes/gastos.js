import { Router } from 'express';
import { query } from '../db/index.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /gastos/resumo
router.get('/resumo', async (req, res, next) => {
  try {
    const { periodo = '12' } = req.query;
    const meses = parseInt(periodo);

    // Total geral
    const totalResult = await query(
      `SELECT COALESCE(SUM(valor_gasto), 0) as total
       FROM manutencoes_realizadas
       WHERE user_id = $1 AND valor_gasto > 0`,
      [req.userId]
    );

    // Total nos últimos N meses
    const totalPeriodoResult = await query(
      `SELECT COALESCE(SUM(valor_gasto), 0) as total
       FROM manutencoes_realizadas
       WHERE user_id = $1
         AND valor_gasto > 0
         AND data_realizacao >= NOW() - INTERVAL '${meses} months'`,
      [req.userId]
    );

    // Gastos por tipo de manutenção
    const porTipoResult = await query(
      `SELECT tm.nome, COALESCE(SUM(mr.valor_gasto), 0) as total, COUNT(mr.id) as quantidade
       FROM tipos_manutencao tm
       LEFT JOIN manutencoes_realizadas mr ON tm.id = mr.tipo_manutencao_id
         AND mr.user_id = $1
         AND mr.data_realizacao >= NOW() - INTERVAL '${meses} months'
       WHERE tm.user_id = $1
       GROUP BY tm.id, tm.nome
       ORDER BY total DESC`,
      [req.userId]
    );

    // Gastos mensais dos últimos N meses
    const mensalResult = await query(
      `SELECT
         TO_CHAR(data_realizacao, 'YYYY-MM') as mes,
         COALESCE(SUM(valor_gasto), 0) as total,
         COUNT(*) as quantidade
       FROM manutencoes_realizadas
       WHERE user_id = $1
         AND valor_gasto > 0
         AND data_realizacao >= NOW() - INTERVAL '${meses} months'
       GROUP BY mes
       ORDER BY mes ASC`,
      [req.userId]
    );

    // Última manutenção com gasto
    const ultimaResult = await query(
      `SELECT mr.*, tm.nome as tipo_nome
       FROM manutencoes_realizadas mr
       JOIN tipos_manutencao tm ON mr.tipo_manutencao_id = tm.id
       WHERE mr.user_id = $1 AND mr.valor_gasto > 0
       ORDER BY mr.data_realizacao DESC
       LIMIT 1`,
      [req.userId]
    );

    res.json({
      total_geral: parseFloat(totalResult.rows[0].total),
      total_periodo: parseFloat(totalPeriodoResult.rows[0].total),
      periodo_meses: meses,
      por_tipo: porTipoResult.rows.map((r) => ({
        nome: r.nome,
        total: parseFloat(r.total),
        quantidade: parseInt(r.quantidade),
      })),
      mensal: mensalResult.rows.map((r) => ({
        mes: r.mes,
        total: parseFloat(r.total),
        quantidade: parseInt(r.quantidade),
      })),
      ultima_manutencao: ultimaResult.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
