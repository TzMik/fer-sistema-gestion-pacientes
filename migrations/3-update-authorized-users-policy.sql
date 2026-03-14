-- ==========================================
-- MIGRATION: ADD UPDATE POLICY FOR AUTHORIZED_USERS
-- ==========================================

-- Permite a los usuarios actualizar sus propios tokens de Google Calendar (Setup Inicial)
CREATE POLICY "Users can update their own config"
ON authorized_users FOR UPDATE
TO authenticated
USING (email = auth.jwt() ->> 'email')
WITH CHECK (email = auth.jwt() ->> 'email');
