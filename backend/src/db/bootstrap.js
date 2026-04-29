import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { initPostgres } from './init-postgres.js';
import { pool, query } from './index.js';

dotenv.config();

const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];
const CHAT_ID = process.argv[4] || null;

if (!EMAIL || !PASSWORD) {
  console.error('Uso: node src/db/bootstrap.js <email> <senha> [chat_id]');
  process.exit(1);
}

(async () => {
  try {
    await initPostgres();

    const existing = await query('SELECT id, telegram_chat_id FROM users WHERE email = $1', [EMAIL.toLowerCase()]);
    if (existing.rows.length > 0) {
      console.log(`Usuário ${EMAIL} já existe (id=${existing.rows[0].id}).`);
      if (CHAT_ID && existing.rows[0].telegram_chat_id !== CHAT_ID) {
        await query('UPDATE users SET telegram_chat_id = $1 WHERE email = $2', [CHAT_ID, EMAIL.toLowerCase()]);
        console.log(`telegram_chat_id atualizado para ${CHAT_ID}.`);
      }
    } else {
      const hash = await bcrypt.hash(PASSWORD, 12);
      const r = await query(
        'INSERT INTO users (email, password_hash, telegram_chat_id) VALUES ($1, $2, $3) RETURNING id',
        [EMAIL.toLowerCase(), hash, CHAT_ID]
      );
      console.log(`Usuário criado: id=${r.rows[0].id} email=${EMAIL}` + (CHAT_ID ? ` chat_id=${CHAT_ID}` : ''));
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Falha:', err);
    process.exit(1);
  }
})();
