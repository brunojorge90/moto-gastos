-- Migration 005: Create config_alertas table
CREATE TABLE IF NOT EXISTS config_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_manutencao_id UUID NOT NULL REFERENCES tipos_manutencao(id) ON DELETE CASCADE,
  km_antecedencia NUMERIC(10,2) NOT NULL DEFAULT 300,
  notificacao_ativa BOOLEAN DEFAULT TRUE,
  CONSTRAINT unique_alerta_tipo UNIQUE (user_id, tipo_manutencao_id)
);

CREATE INDEX IF NOT EXISTS idx_config_alertas_user_id ON config_alertas(user_id);
