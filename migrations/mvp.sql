-- ==========================================
-- 1. SECURITY: RESTRICTED ACCESS (WHITELIST)
-- ==========================================

-- Table for authorized emails (Google OAuth Login)
CREATE TABLE IF NOT EXISTS authorized_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;

-- Function to validate registration in Supabase Auth
CREATE OR REPLACE FUNCTION public.check_user_allowed()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.authorized_users WHERE email = NEW.email) THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Your account is not authorized to access this system.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to be applied on auth.users (handled via Supabase Dashboard/SQL Editor)
-- CREATE TRIGGER on_auth_user_created
-- BEFORE INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.check_user_allowed();


-- ==========================================
-- 2. CORE ENTITIES
-- ==========================================

-- Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code TEXT UNIQUE, -- Automatically generated (e.g., PAC-001)
    full_name TEXT NOT NULL,
    birth_date DATE,
    requires_invoice BOOLEAN DEFAULT FALSE,
    credit_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_vat_included DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_event_id TEXT UNIQUE, 
    patient_1_id UUID REFERENCES patients(id),
    patient_2_id UUID REFERENCES patients(id), -- Support for couples 
    service_id UUID REFERENCES services(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'attended', 'cancelled_with_penalty', 'cancelled_without_penalty', 'rescheduled')) DEFAULT 'pending',
    is_invoiced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('card', 'transfer', 'cash', 'credit_balance')),
    is_taxable BOOLEAN DEFAULT FALSE, -- True only for card/transfer
    is_paid BOOLEAN DEFAULT FALSE,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 3. AUTOMATION: PATIENT CODES
-- ==========================================

-- 1. Creamos una secuencia para llevar el conteo de pacientes de forma segura
CREATE SEQUENCE IF NOT EXISTS patient_code_seq;

-- 2. Modificamos la función para que use la secuencia y el formato PAC-0000
CREATE OR REPLACE FUNCTION generate_patient_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INTEGER;
BEGIN
    -- Obtenemos el siguiente valor de la secuencia
    next_val := nextval('patient_code_seq');
    
    -- Formateamos el código con ceros a la izquierda (LPAD a 4 dígitos)
    NEW.patient_code := 'PAC-' || LPAD(next_val::text, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Re-creamos el trigger (eliminando el anterior por si acaso)
DROP TRIGGER IF EXISTS tr_generate_patient_code ON patients;

CREATE TRIGGER tr_generate_patient_code
BEFORE INSERT ON patients
FOR EACH ROW
EXECUTE FUNCTION generate_patient_code();


-- ==========================================
-- 4. FINANCIAL DASHBOARD VIEWS
-- ==========================================

-- View for monthly financial summary
CREATE VIEW financial_dashboard_summary AS
SELECT 
    -- Expected Income (Total price of all scheduled appointments for the current month)
    COALESCE(SUM(s.price_vat_included), 0) as expected_monthly_income,
    
    -- Real Income (Total paid amounts)
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE is_paid = TRUE) as real_monthly_income,
    
    -- Estimated Taxes (16% VAT based only on taxable methods: card/transfer) 
    (SELECT COALESCE(SUM(amount * 0.16), 0) FROM payments WHERE is_taxable = TRUE AND is_paid = TRUE) as estimated_tax_liability,
    
    -- Total Debt from Defaulters (attended/penalty status without payment) [cite: 7]
    (SELECT COALESCE(SUM(s.price_vat_included), 0) 
     FROM appointments a 
     JOIN services s ON a.service_id = s.id 
     LEFT JOIN payments p ON a.id = p.appointment_id 
     WHERE (a.status = 'attended' OR a.status = 'cancelled_with_penalty') 
     AND (p.is_paid = FALSE OR p.id IS NULL)) as total_debtor_amount
FROM appointments a
JOIN services s ON a.service_id = s.id
WHERE date_trunc('month', a.appointment_date) = date_trunc('month', current_date);

-- ==========================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ==========================================

ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. CREAR FUNCIÓN DE VERIFICACIÓN
-- ==========================================
-- Esta función comprueba si el usuario autenticado (vía Google) 
-- está en la lista de correos autorizados.

CREATE OR REPLACE FUNCTION public.is_authorized()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.authorized_users 
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. DEFINIR POLÍTICAS DE ACCESO (POLICIES)
-- ==========================================

-- Política para authorized_users (Solo pueden verse a sí mismos o si son admin)
CREATE POLICY "Authorized users are viewable by authenticated allowed users"
ON authorized_users FOR SELECT
TO authenticated
USING (public.is_authorized());

-- Política para Patients
CREATE POLICY "Manage patients"
ON patients FOR ALL
TO authenticated
USING (public.is_authorized())
WITH CHECK (public.is_authorized());

-- Política para Services
CREATE POLICY "Manage services"
ON services FOR ALL
TO authenticated
USING (public.is_authorized())
WITH CHECK (public.is_authorized());

-- Política para Appointments
CREATE POLICY "Manage appointments"
ON appointments FOR ALL
TO authenticated
USING (public.is_authorized())
WITH CHECK (public.is_authorized());

-- Política para Payments
CREATE POLICY "Manage payments"
ON payments FOR ALL
TO authenticated
USING (public.is_authorized())
WITH CHECK (public.is_authorized());