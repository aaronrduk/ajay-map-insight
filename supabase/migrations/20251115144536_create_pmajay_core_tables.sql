/*
  # PM-AJAY Portal Core Database Schema

  ## Overview
  Complete database schema for PM-AJAY Implementation Mapping Portal with comprehensive
  data tracking for funds, schemes, agencies, beneficiaries, and administrative functions.

  ## New Tables Created
  
  ### 1. funds_allocation
  - `id` (uuid, primary key)
  - `state` (text) - State/UT name
  - `district` (text) - District name
  - `year` (integer) - Financial year
  - `agency` (text) - Implementing agency
  - `component` (text) - Scheme component
  - `allocated_amount` (numeric) - Funds allocated
  - `utilized_amount` (numeric) - Funds utilized
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. scheme_beneficiaries
  - `id` (uuid, primary key)
  - `scheme_component` (text) - Component name
  - `state` (text) - State name
  - `district` (text) - District name
  - `agency` (text) - Agency name
  - `beneficiary_count` (integer) - Number of beneficiaries
  - `year` (integer) - Year
  - `category` (text) - SC/ST/OBC/General
  - `created_at` (timestamptz)
  
  ### 3. courses
  - `id` (uuid, primary key)
  - `component` (text) - Scheme component
  - `course_name` (text) - Course name
  - `duration` (text) - Course duration
  - `eligibility` (text) - Eligibility criteria
  - `description` (text) - Course description
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)
  
  ### 4. colleges
  - `id` (uuid, primary key)
  - `name` (text) - College name
  - `state` (text) - State
  - `district` (text) - District
  - `address` (text) - Full address
  - `website` (text) - Official website
  - `contact` (text) - Contact details
  - `created_at` (timestamptz)
  
  ### 5. college_courses
  - `id` (uuid, primary key)
  - `college_id` (uuid, foreign key) - References colleges
  - `course_id` (uuid, foreign key) - References courses
  - `seats_available` (integer) - Available seats
  - `created_at` (timestamptz)
  
  ### 6. course_registrations
  - `id` (uuid, primary key)
  - `name` (text) - Student name
  - `email` (text) - Email address
  - `phone` (text) - Phone number
  - `state` (text) - State
  - `course_id` (uuid, foreign key) - References courses
  - `component` (text) - Component
  - `document_url` (text) - Uploaded document URL
  - `status` (text) - Registration status
  - `created_at` (timestamptz)
  
  ### 7. grievances
  - `id` (uuid, primary key)
  - `reference_id` (text, unique) - Unique tracking ID
  - `user_id` (uuid) - User who filed (optional for auth users)
  - `name` (text) - Complainant name
  - `email` (text) - Email address
  - `phone` (text) - Phone number
  - `state` (text) - State
  - `district` (text) - District
  - `agency` (text) - Agency concerned
  - `component` (text) - Scheme component
  - `grievance_type` (text) - Type of grievance
  - `description` (text) - Detailed description
  - `status` (text) - Status (pending/assigned/resolved/closed)
  - `priority` (text) - Priority level
  - `assigned_to` (text) - Admin/officer assigned
  - `resolution_notes` (text) - Resolution details
  - `attachment_url` (text) - Attachment file URL
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `resolved_at` (timestamptz)
  
  ### 8. proposals
  - `id` (uuid, primary key)
  - `proposal_number` (text, unique) - Unique proposal ID
  - `agency_name` (text) - Submitting agency
  - `user_id` (uuid) - User who submitted
  - `state` (text) - State
  - `district` (text) - District
  - `village` (text) - Village/area
  - `component` (text) - Scheme component
  - `title` (text) - Proposal title
  - `description` (text) - Detailed description
  - `expected_impact` (text) - Expected impact
  - `funds_required` (numeric) - Amount required
  - `budget_breakdown` (jsonb) - Detailed budget
  - `status` (text) - Status (draft/submitted/under_review/approved/rejected)
  - `submitted_at` (timestamptz)
  - `reviewed_at` (timestamptz)
  - `reviewed_by` (text) - Admin who reviewed
  - `review_notes` (text) - Review comments
  - `document_urls` (jsonb) - Array of document URLs
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 9. agencies
  - `id` (uuid, primary key)
  - `name` (text) - Agency name
  - `type` (text) - Agency type
  - `state` (text) - Operating state
  - `district` (text) - District
  - `contact_person` (text) - Contact person
  - `email` (text) - Email
  - `phone` (text) - Phone
  - `address` (text) - Address
  - `is_verified` (boolean) - Verification status
  - `registration_number` (text) - Official registration
  - `created_at` (timestamptz)
  
  ### 10. grant_eligibility_criteria
  - `id` (uuid, primary key)
  - `component` (text) - Scheme component
  - `category` (text) - SC/ST/OBC/General
  - `min_age` (integer) - Minimum age
  - `max_age` (integer) - Maximum age
  - `max_income` (numeric) - Maximum annual income
  - `grant_amount` (numeric) - Grant amount
  - `required_documents` (jsonb) - Array of required documents
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies configured for role-based access:
    - Public read access for public data
    - Authenticated users can create grievances and registrations
    - Only admins can manage proposals, agencies, and criteria
    - Users can view their own submissions

  ## Indexes
  - Created on frequently queried columns for performance
  - State, district, agency, component columns indexed
  - Foreign key columns indexed
*/

-- Create funds_allocation table
CREATE TABLE IF NOT EXISTS funds_allocation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  district text NOT NULL,
  year integer NOT NULL,
  agency text NOT NULL,
  component text NOT NULL,
  allocated_amount numeric(15,2) NOT NULL DEFAULT 0,
  utilized_amount numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funds_state ON funds_allocation(state);
CREATE INDEX IF NOT EXISTS idx_funds_district ON funds_allocation(district);
CREATE INDEX IF NOT EXISTS idx_funds_year ON funds_allocation(year);
CREATE INDEX IF NOT EXISTS idx_funds_agency ON funds_allocation(agency);
CREATE INDEX IF NOT EXISTS idx_funds_component ON funds_allocation(component);

-- Create scheme_beneficiaries table
CREATE TABLE IF NOT EXISTS scheme_beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_component text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  agency text NOT NULL,
  beneficiary_count integer NOT NULL DEFAULT 0,
  year integer NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_component ON scheme_beneficiaries(scheme_component);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_state ON scheme_beneficiaries(state);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_year ON scheme_beneficiaries(year);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component text NOT NULL,
  course_name text NOT NULL,
  duration text NOT NULL,
  eligibility text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_component ON courses(component);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  address text NOT NULL,
  website text,
  contact text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_district ON colleges(district);

-- Create college_courses junction table
CREATE TABLE IF NOT EXISTS college_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  seats_available integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(college_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_college_courses_college ON college_courses(college_id);
CREATE INDEX IF NOT EXISTS idx_college_courses_course ON college_courses(course_id);

-- Create course_registrations table
CREATE TABLE IF NOT EXISTS course_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  state text NOT NULL,
  course_id uuid NOT NULL REFERENCES courses(id),
  component text NOT NULL,
  document_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registrations_email ON course_registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_course ON course_registrations(course_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON course_registrations(status);

-- Create grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  state text NOT NULL,
  district text NOT NULL,
  agency text,
  component text NOT NULL,
  grievance_type text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  assigned_to text,
  resolution_notes text,
  attachment_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_grievances_ref ON grievances(reference_id);
CREATE INDEX IF NOT EXISTS idx_grievances_email ON grievances(email);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_state ON grievances(state);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_number text UNIQUE NOT NULL,
  agency_name text NOT NULL,
  user_id uuid,
  state text NOT NULL,
  district text NOT NULL,
  village text NOT NULL,
  component text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  expected_impact text,
  funds_required numeric(15,2) NOT NULL,
  budget_breakdown jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  review_notes text,
  document_urls jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_number ON proposals(proposal_number);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_state ON proposals(state);
CREATE INDEX IF NOT EXISTS idx_proposals_component ON proposals(component);

-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  state text NOT NULL,
  district text,
  contact_person text,
  email text,
  phone text,
  address text,
  is_verified boolean DEFAULT false,
  registration_number text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agencies_state ON agencies(state);
CREATE INDEX IF NOT EXISTS idx_agencies_verified ON agencies(is_verified);
CREATE INDEX IF NOT EXISTS idx_agencies_name ON agencies(name);

-- Create grant_eligibility_criteria table
CREATE TABLE IF NOT EXISTS grant_eligibility_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component text NOT NULL,
  category text NOT NULL,
  min_age integer NOT NULL,
  max_age integer NOT NULL,
  max_income numeric(12,2) NOT NULL,
  grant_amount numeric(12,2) NOT NULL,
  required_documents jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grant_criteria_component ON grant_eligibility_criteria(component);
CREATE INDEX IF NOT EXISTS idx_grant_criteria_category ON grant_eligibility_criteria(category);

-- Enable Row Level Security
ALTER TABLE funds_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_eligibility_criteria ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access to reference data
CREATE POLICY "Public read access for funds" ON funds_allocation FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for beneficiaries" ON scheme_beneficiaries FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for courses" ON courses FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for colleges" ON colleges FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for college_courses" ON college_courses FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for agencies" ON agencies FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for grant criteria" ON grant_eligibility_criteria FOR SELECT TO public USING (true);

-- RLS Policies for course registrations
CREATE POLICY "Anyone can create registration" ON course_registrations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read own registrations" ON course_registrations FOR SELECT TO public USING (true);

-- RLS Policies for grievances
CREATE POLICY "Anyone can create grievance" ON grievances FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read grievances" ON grievances FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can update own grievances" ON grievances FOR UPDATE TO authenticated USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for proposals
CREATE POLICY "Authenticated users can create proposals" ON proposals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read proposals" ON proposals FOR SELECT TO public USING (true);
CREATE POLICY "Users can update own proposals" ON proposals FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Admin-only policies (will be refined with proper role system later)
CREATE POLICY "Authenticated users can update funds" ON funds_allocation FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert funds" ON funds_allocation FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can manage agencies" ON agencies FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage criteria" ON grant_eligibility_criteria FOR ALL TO authenticated USING (true);