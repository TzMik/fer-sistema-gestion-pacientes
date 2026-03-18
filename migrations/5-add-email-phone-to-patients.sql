-- Add email and phone fields to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
