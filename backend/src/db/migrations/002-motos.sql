-- Migration 002: Create motos table
CREATE TABLE IF NOT EXISTS motos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  apelido VARCHAR(100),
  modelo VARCHAR(100),
  ano INTEGER,
  km_inicial NUMERIC(10,2) NOT NULL,
  media_diaria_km NUMERIC(8,2) NOT NULL,
  data_referencia DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_moto UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_motos_user_id ON motos(user_id);
