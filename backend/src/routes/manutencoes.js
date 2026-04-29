import { Router } from 'express';
import { query } from '../db/index.js';
import authMiddleware from '../middleware/auth.js';
import { calcularStatusManutencoes } from '../services/alertaService.js';

const router = Router();
router.use(authMiddleware);

// GET /manutencoes/tipos
router.get('/tipos', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM tipos_manutencao WHERE user_id = $1 ORDER BY nome',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /manutencoes/tipos
router.post('/tipos', async (req, res, next) => {
  try {
    const { nome, intervalo_km } = req.body;

    if (!nome || !intervalo_km) {
      return res.status(400).json({ error: 'nome e intervalo_km são obrigatórios' });
    }

    if (parseFloat(intervalo_km) <= 0) {
      return res.status(400).json({ error: 'intervalo_km deve ser maior que zero' });
    }

    const result = await query(
      'INSERT INTO tipos_manutencao (user_id, nome, intervalo_km) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, nome.trim(), intervalo_km]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /manutencoes/tipos/:id
router.put('/tipos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, intervalo_km, ativo } = req.body;

    if (!nome || !intervalo_km) {
      return res.status(400).json({ error: 'nome e intervalo_km são obrigatórios' });
    }

    const result = await query(
      `UPDATE tipos_manutencao
       SET nome = $2, intervalo_km = $3, ativo = $4
       WHERE id = $1 AND user_id = $5
       RETURNING *`,
      [id, nome.trim(), intervalo_km, ativo !== undefined ? ativo : true, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de manutenção não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /manutencoes/tipos/:id
router.delete('/tipos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM tipos_manutencao WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de manutenção não encontrado' });
    }

    res.json({ message: 'Tipo de manutenção removido com sucesso' });
  } catch (err) {
    next(err);
  }
});

// GET /manutencoes/status
router.get('/status', async (req, res, next) => {
  try {
    const { moto, kmAtual, statusList } = await calcularStatusManutencoes(req.userId);

    if (!moto) {
      return res.json({ moto: null, km_atual: null, statusList: [] });
    }

    res.json({ moto, km_atual: kmAtual, statusList });
  } catch (err) {
    next(err);
  }
});

// GET /manutencoes/realizadas
router.get('/realizadas', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, tipo_manutencao_id } = req.query;

    let queryText = `
      SELECT mr.*, tm.nome as tipo_nome
      FROM manutencoes_realizadas mr
      JOIN tipos_manutencao tm ON mr.tipo_manutencao_id = tm.id
      WHERE mr.user_id = $1
    `;
    const params = [req.userId];

    if (tipo_manutencao_id) {
      params.push(tipo_manutencao_id);
      queryText += ` AND mr.tipo_manutencao_id = $${params.length}`;
    }

    queryText += ` ORDER BY mr.data_realizacao DESC, mr.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /manutencoes/realizadas
router.post('/realizadas', async (req, res, next) => {
  try {
    const { tipo_manutencao_id, data_realizacao, km_no_momento, valor_gasto, observacao } = req.body;

    if (!tipo_manutencao_id || !data_realizacao || !km_no_momento) {
      return res.status(400).json({
        error: 'tipo_manutencao_id, data_realizacao e km_no_momento são obrigatórios',
      });
    }

    const tipoCheck = await query(
      'SELECT id FROM tipos_manutencao WHERE id = $1 AND user_id = $2',
      [tipo_manutencao_id, req.userId]
    );
    if (tipoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de manutenção não encontrado' });
    }

    const result = await query(
      `INSERT INTO manutencoes_realizadas
         (user_id, tipo_manutencao_id, data_realizacao, km_no_momento, valor_gasto, observacao)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.userId, tipo_manutencao_id, data_realizacao, km_no_momento, valor_gasto || 0, observacao]
    );

    const inserted = result.rows[0];

    const tipoResult = await query('SELECT nome FROM tipos_manutencao WHERE id = $1', [tipo_manutencao_id]);
    inserted.tipo_nome = tipoResult.rows[0]?.nome;

    // Reseta o anti-spam: novo ciclo, pode notificar quando se aproximar de novo.
    await query(
      'UPDATE config_alertas SET last_notificado_at = NULL WHERE user_id = $1 AND tipo_manutencao_id = $2',
      [req.userId, tipo_manutencao_id]
    );

    res.status(201).json(inserted);
  } catch (err) {
    next(err);
  }
});

// DELETE /manutencoes/realizadas/:id
router.delete('/realizadas/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM manutencoes_realizadas WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    res.json({ message: 'Manutenção removida com sucesso' });
  } catch (err) {
    next(err);
  }
});

export default router;
