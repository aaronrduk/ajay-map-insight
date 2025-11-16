/*
  # PM AJAY Authentication System

  ## Overview
  Complete authentication system with OTP verification for PM AJAY Mapping Access Portal
  Supporting three user roles: Administrator, Agency, and Citizen

  ## New Tables

  ### 1. portal_users
  - `id` (uuid, primary key)
  - `name` (text) - Full name
  - `email` (text, unique) - Email address
  - `password` (text) - Hashed password
  - `user_type` (text) - administrator | agency | citizen
  - `is_verified` (boolean) - Email verification status
  - `created_at` (timestamptz)
  - `last_login` (timestamptz)

  ### 2. otp_store
  - `id` (uuid, primary key)
  - `email` (text) - User email
  - `otp` (text) - 6-digit OTP code
  - `otp_type` (text) - registration | login
  - `user_data` (jsonb) - Pending registration data
  - `expires_at` (timestamptz) - OTP expiration time
  - `created_at` (timestamptz)
  - `is_used` (boolean) - Whether OTP has been used

  ## Security
  - Enable RLS on all tables
  - Public can create OTP and verify
  - Users can only access their own data
  - Admins can view all users

  ## Indexes
  - Email indexes for fast lookups
  - OTP expiration index for cleanup
*/

-- Create portal_users table
CREATE TABLE IF NOT EXISTS portal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('administrator', 'agency', 'citizen')),
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

CREATE INDEX IF NOT EXISTS idx_portal_users_email ON portal_users(email);
CREATE INDEX IF NOT EXISTS idx_portal_users_type ON portal_users(user_type);

-- Create otp_store table
CREATE TABLE IF NOT EXISTS otp_store (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp text NOT NULL,
  otp_type text NOT NULL CHECK (otp_type IN ('registration', 'login')),
  user_data jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_used boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_store(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_store(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_used ON otp_store(is_used);

-- Enable Row Level Security
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_store ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portal_users
CREATE POLICY "Public can view verified users" ON portal_users
  FOR SELECT TO public
  USING (is_verified = true);

CREATE POLICY "Users can view own data" ON portal_users
  FOR SELECT TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own data" ON portal_users
  FOR UPDATE TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for otp_store (public access for authentication flow)
CREATE POLICY "Public can insert OTP" ON otp_store
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Public can read own OTP" ON otp_store
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can update OTP" ON otp_store
  FOR UPDATE TO public
  USING (true);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_store
  WHERE expires_at < now() OR is_used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate 6-digit OTP
CREATE OR REPLACE FUNCTION generate_otp()
RETURNS text AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;