import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL não configurado no .env');
}

// Neon e maioria dos hosted Postgres exigem SSL.
// rejectUnauthorized:false é seguro para Neon (cert é trusted mas a CA não vem no store local).
const ssl =
  process.env.PGSSL === 'disable'
    ? false
    : { rejectUnauthorized: false };

export const pool = new Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Erro inesperado no pool Postgres:', err);
});

export const query = (text, params = []) => pool.query(text, params);

export const getClient = () => pool.connect();

export default pool;
