import { pool } from './index.js';

export async function initPostgres() {
  const client = await pool.connect();
  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        telegram_chat_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS motos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        apelido TEXT,
        modelo TEXT,
        ano INTEGER,
        km_inicial DOUBLE PRECISION NOT NULL,
        media_diaria_km DOUBLE PRECISION NOT NULL,
        data_referencia DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );

      CREATE TABLE IF NOT EXISTS tipos_manutencao (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        intervalo_km DOUBLE PRECISION NOT NULL,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS manutencoes_realizadas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tipo_manutencao_id UUID NOT NULL REFERENCES tipos_manutencao(id) ON DELETE CASCADE,
        data_realizacao DATE NOT NULL,
        km_no_momento DOUBLE PRECISION NOT NULL,
        valor_gasto DOUBLE PRECISION DEFAULT 0,
        observacao TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS config_alertas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tipo_manutencao_id UUID NOT NULL REFERENCES tipos_manutencao(id) ON DELETE CASCADE,
        km_antecedencia DOUBLE PRECISION NOT NULL DEFAULT 300,
        notificacao_ativa BOOLEAN DEFAULT TRUE,
        last_notificado_at TIMESTAMPTZ,
        UNIQUE(user_id, tipo_manutencao_id)
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_motos_user_id ON motos(user_id);
      CREATE INDEX IF NOT EXISTS idx_tipos_user_id ON tipos_manutencao(user_id);
      CREATE INDEX IF NOT EXISTS idx_manut_user_id ON manutencoes_realizadas(user_id);
      CREATE INDEX IF NOT EXISTS idx_alertas_user_id ON config_alertas(user_id);
    `);

    // Migrações idempotentes para colunas adicionadas após o esquema inicial.
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT');
    await client.query('ALTER TABLE config_alertas ADD COLUMN IF NOT EXISTS last_notificado_at TIMESTAMPTZ');

    console.log('Database schema ready (Postgres).');
  } finally {
    client.release();
  }
}
