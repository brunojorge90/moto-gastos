import { Router } from 'express';
import { query } from '../db/index.js';
import authMiddleware from '../middleware/auth.js';
import { calcularKmAtual } from '../services/kmService.js';

const router = Router();
router.use(authMiddleware);

// GET /moto
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM motos WHERE user_id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.json({ moto: null, km_atual: null });
    }

    const moto = result.rows[0];
    const kmAtual = calcularKmAtual(moto);

    res.json({ moto, km_atual: kmAtual });
  } catch (err) {
    next(err);
  }
});

// POST /moto
router.post('/', async (req, res, next) => {
  try {
    const { apelido, modelo, ano, km_inicial, media_diaria_km, data_referencia } = req.body;

    if (!km_inicial || !media_diaria_km || !data_referencia) {
      return res.status(400).json({
        error: 'km_inicial, media_diaria_km e data_referencia são obrigatórios',
      });
    }

    const existing = await query('SELECT id FROM motos WHERE user_id = $1', [req.userId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Moto já cadastrada. Use PUT para atualizar.' });
    }

    const result = await query(
      `INSERT INTO motos (user_id, apelido, modelo, ano, km_inicial, media_diaria_km, data_referencia)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.userId, apelido, modelo, ano, km_inicial, media_diaria_km, data_referencia]
    );

    const moto = result.rows[0];
    const kmAtual = calcularKmAtual(moto);

    res.status(201).json({ moto, km_atual: kmAtual });
  } catch (err) {
    next(err);
  }
});

// PUT /moto
router.put('/', async (req, res, next) => {
  try {
    const { apelido, modelo, ano, km_inicial, media_diaria_km, data_referencia } = req.body;

    if (!km_inicial || !media_diaria_km || !data_referencia) {
      return res.status(400).json({
        error: 'km_inicial, media_diaria_km e data_referencia são obrigatórios',
      });
    }

    const result = await query(
      `UPDATE motos
       SET apelido = $2, modelo = $3, ano = $4, km_inicial = $5,
           media_diaria_km = $6, data_referencia = $7, updated_at = NOW()
       WHERE user_id = $1
       RETURNING *`,
      [req.userId, apelido, modelo, ano, km_inicial, media_diaria_km, data_referencia]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Moto não encontrada. Use POST para cadastrar.' });
    }

    const moto = result.rows[0];
    const kmAtual = calcularKmAtual(moto);

    res.json({ moto, km_atual: kmAtual });
  } catch (err) {
    next(err);
  }
});

export default router;
