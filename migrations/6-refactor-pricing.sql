-- Migration: Refactor Pricing
-- Description: Remove services table and service_id from appointments. 
-- Add custom_price to patients and price to appointments.

-- 1. Update Patients Table
ALTER TABLE patients ADD COLUMN custom_price DECIMAL(10,2) DEFAULT 700.00;

-- 2. Update Appointments Table
ALTER TABLE appointments ADD COLUMN price DECIMAL(10,2);

-- 4. Drop dependency and table
-- First, drop the view that depends on services
DROP VIEW IF EXISTS financial_dashboard_summary;

-- Drop the service_id column
ALTER TABLE appointments DROP COLUMN service_id;

-- Drop the services table
DROP TABLE IF EXISTS services;

-- 5. Recreate the view using the new schema
CREATE VIEW financial_dashboard_summary AS
SELECT 
    -- Expected Income (Total price of all scheduled appointments for the current month)
    COALESCE(SUM(a.price), 0) as expected_monthly_income,
    
    -- Real Income (Total paid amounts)
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE is_paid = TRUE) as real_monthly_income,
    
    -- Estimated Taxes (16% VAT based only on taxable methods: card/transfer) 
    (SELECT COALESCE(SUM(amount * 0.16), 0) FROM payments WHERE is_taxable = TRUE AND is_paid = TRUE) as estimated_tax_liability,
    
    -- Total Debt from Defaulters (attended/penalty status without payment)
    (SELECT COALESCE(SUM(a2.price), 0) 
     FROM appointments a2
     LEFT JOIN payments p ON a2.id = p.appointment_id 
     WHERE (a2.status = 'attended' OR a2.status = 'cancelled_with_penalty') 
     AND (p.is_paid = FALSE OR p.id IS NULL)) as total_debtor_amount
FROM appointments a
WHERE date_trunc('month', a.appointment_date) = date_trunc('month', current_date);
