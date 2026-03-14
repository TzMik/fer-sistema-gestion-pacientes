-- ==========================================
-- MIGRATION: UPDATE AUTHORIZED_USERS FOR OAUTH
-- ==========================================

-- 1. Agregamos los campos necesarios para la integración de Google
ALTER TABLE authorized_users 
ADD COLUMN IF NOT EXISTS google_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
ADD COLUMN IF NOT EXISTS calendar_refresh_token TEXT;

-- 2. Comentario descriptivo para las columnas (Opcional, ayuda en Supabase)
COMMENT ON COLUMN authorized_users.google_user_id IS 'ID único del usuario proporcionado por Google OAuth';
COMMENT ON COLUMN authorized_users.google_calendar_id IS 'El ID del calendario específico a sincronizar (ej. primary o email)';
COMMENT ON COLUMN authorized_users.calendar_refresh_token IS 'Token permanente para generar nuevos access_tokens en segundo plano';