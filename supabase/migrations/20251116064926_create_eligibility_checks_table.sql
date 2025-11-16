/*
  # Create Eligibility Checks Table for Grant-in-Aid

  ## 1. New Tables
  
  ### `eligibility_checks`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, nullable) - Links to portal_users if logged in
  - `full_name` (text) - Applicant's full name
  - `caste` (text) - Caste category
  - `annual_income` (numeric) - Annual income in rupees
  - `state` (text) - State name
  - `district` (text) - District name
  - `village` (text) - Village name
  - `is_eligible` (boolean) - Eligibility result
  - `created_at` (timestamptz) - Timestamp of check

  ## 2. Security
  - Enable RLS on the table
  - Anyone can insert eligibility checks
  - Users can view their own checks
  - Admins can view all checks
*/

-- Create eligibility_checks table
CREATE TABLE IF NOT EXISTS eligibility_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES portal_users(id),
  full_name text NOT NULL,
  caste text NOT NULL,
  annual_income numeric NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  village text NOT NULL,
  is_eligible boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE eligibility_checks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert eligibility checks
CREATE POLICY "Anyone can create eligibility checks"
  ON eligibility_checks FOR INSERT
  WITH CHECK (true);

-- Users can view their own eligibility checks
CREATE POLICY "Users can view own eligibility checks"
  ON eligibility_checks FOR SELECT
  USING (
    user_id IS NULL OR
    user_id IN (SELECT id FROM portal_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
  );

-- Admins can view all eligibility checks
CREATE POLICY "Admins can view all eligibility checks"
  ON eligibility_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND portal_users.user_type = 'administrator'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_user_id ON eligibility_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_created_at ON eligibility_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_is_eligible ON eligibility_checks(is_eligible);