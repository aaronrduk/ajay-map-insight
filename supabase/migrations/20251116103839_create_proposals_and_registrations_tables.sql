/*
  # Create Proposals and Course Registrations Tables

  ## 1. New Tables
  
  ### `agency_proposals`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Links to portal_users (agency)
  - `title` (text) - Proposal title
  - `category` (text) - Proposal category
  - `description` (text) - Detailed description
  - `document_url` (text, nullable) - Uploaded document URL
  - `status` (text) - pending/accepted/rejected
  - `admin_reply` (text, nullable) - Admin's response
  - `admin_user_id` (uuid, nullable) - Admin who reviewed
  - `reviewed_at` (timestamptz, nullable) - Review timestamp
  - `created_at` (timestamptz) - Submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `course_registrations_new`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Links to portal_users (citizen)
  - `full_name` (text) - Student name
  - `course_id` (uuid) - Links to courses table
  - `college_id` (uuid) - Links to colleges table
  - `reason` (text) - Reason for choosing course
  - `status` (text) - pending/accepted/rejected
  - `admin_comment` (text, nullable) - Admin's decision comment
  - `admin_user_id` (uuid, nullable) - Admin who reviewed
  - `reviewed_at` (timestamptz, nullable) - Review timestamp
  - `created_at` (timestamptz) - Registration timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  - Enable RLS on both tables
  - Agencies can view/create their own proposals
  - Citizens can view/create their own registrations
  - Admins can view and update all records
*/

-- Create agency_proposals table
CREATE TABLE IF NOT EXISTS agency_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES portal_users(id) NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  document_url text,
  status text DEFAULT 'pending',
  admin_reply text,
  admin_user_id uuid REFERENCES portal_users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course_registrations_new table
CREATE TABLE IF NOT EXISTS course_registrations_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES portal_users(id) NOT NULL,
  full_name text NOT NULL,
  course_id uuid REFERENCES courses(id) NOT NULL,
  college_id uuid REFERENCES colleges(id) NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  admin_comment text,
  admin_user_id uuid REFERENCES portal_users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agency_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_registrations_new ENABLE ROW LEVEL SECURITY;

-- Agency Proposals Policies
CREATE POLICY "Agencies can view own proposals"
  ON agency_proposals FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM portal_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Agencies can create proposals"
  ON agency_proposals FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM portal_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can view all proposals"
  ON agency_proposals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND portal_users.user_type = 'administrator'
    )
  );

CREATE POLICY "Admins can update proposals"
  ON agency_proposals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND portal_users.user_type = 'administrator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND portal_users.user_type = 'administrator'
    )
  );

-- Course Registrations Policies
CREATE POLICY "Citizens can view own registrations"
  ON course_registrations_new FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM portal_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Citizens can create registrations"
  ON course_registrations_new FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM portal_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can view all registrations"
  ON course_registrations_new FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND portal_users.user_type = 'administrator'
    )
  );

CREATE POLICY "Admins can update registrations"
  ON course_registrations_new FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND portal_users.user_type = 'administrator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND portal_users.user_type = 'administrator'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agency_proposals_user_id ON agency_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_proposals_status ON agency_proposals(status);
CREATE INDEX IF NOT EXISTS idx_agency_proposals_created_at ON agency_proposals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_course_registrations_new_user_id ON course_registrations_new(user_id);
CREATE INDEX IF NOT EXISTS idx_course_registrations_new_status ON course_registrations_new(status);
CREATE INDEX IF NOT EXISTS idx_course_registrations_new_created_at ON course_registrations_new(created_at DESC);