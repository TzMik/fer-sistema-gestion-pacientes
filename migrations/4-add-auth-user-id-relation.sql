-- ==========================================
-- MIGRATION: LINK AUTHORIZED_USERS TO AUTH.USERS
-- ==========================================

-- 1. Agregamos la columna para vincular con la tabla interna de Supabase
ALTER TABLE authorized_users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- 2. Índice para búsquedas rápidas por ID de usuario
CREATE INDEX IF NOT EXISTS idx_authorized_users_auth_id ON authorized_users(auth_user_id);

COMMENT ON COLUMN authorized_users.auth_user_id IS 'Referencia al ID único de la tabla auth.users de Supabase';
