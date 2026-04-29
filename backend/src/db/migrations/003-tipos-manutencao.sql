-- Migration 003: Create tipos_manutencao table
CREATE TABLE IF NOT EXISTS tipos_manutencao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  intervalo_km NUMERIC(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tipos_manutencao_user_id ON tipos_manutencao(user_id);
