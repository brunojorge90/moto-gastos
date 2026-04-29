-- Migration 004: Create manutencoes_realizadas table
CREATE TABLE IF NOT EXISTS manutencoes_realizadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_manutencao_id UUID NOT NULL REFERENCES tipos_manutencao(id) ON DELETE CASCADE,
  data_realizacao DATE NOT NULL,
  km_no_momento NUMERIC(10,2) NOT NULL,
  valor_gasto NUMERIC(10,2) DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manutencoes_realizadas_user_id ON manutencoes_realizadas(user_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_realizadas_tipo ON manutencoes_realizadas(tipo_manutencao_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_realizadas_data ON manutencoes_realizadas(data_realizacao);
