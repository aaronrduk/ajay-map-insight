/*
  # Create Route Index for AI Chatbot Navigation

  ## 1. New Tables
  
  ### `route_index`
  - `id` (serial, primary key)
  - `path` (text) - Route path like /citizen/grievance
  - `title` (text) - Display title like "Submit Grievance"
  - `description` (text) - Description for search
  - `keywords` (text[]) - Search keywords
  - `user_type` (text) - citizen/agency/admin/public
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS with public read access
  - Insert common routes for navigation
*/

CREATE TABLE IF NOT EXISTS route_index (
  id serial PRIMARY KEY,
  path text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  user_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE route_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read routes"
  ON route_index FOR SELECT
  USING (true);

INSERT INTO route_index (path, title, description, keywords, user_type) VALUES
  ('/', 'Home', 'Homepage and main navigation', ARRAY['home', 'main', 'start', 'index'], 'public'),
  ('/login', 'Login', 'Login to your account', ARRAY['login', 'signin', 'sign in', 'authenticate'], 'public'),
  
  ('/citizen-dashboard', 'Citizen Dashboard', 'Citizen portal dashboard', ARRAY['citizen', 'dashboard', 'home', 'portal'], 'citizen'),
  ('/citizen/grant-in-aid', 'Grant-in-Aid', 'Apply for grant-in-aid schemes', ARRAY['grant', 'aid', 'financial', 'apply', 'funding'], 'citizen'),
  ('/citizen/grant-in-aid/eligibility', 'Check Eligibility', 'Check grant eligibility', ARRAY['eligibility', 'check', 'qualify', 'eligible'], 'citizen'),
  ('/citizen/grievance', 'Submit Grievance', 'File a grievance or complaint', ARRAY['grievance', 'complaint', 'issue', 'problem', 'file', 'submit'], 'citizen'),
  ('/citizen/grievance/view', 'View My Grievances', 'Track your submitted grievances', ARRAY['view', 'track', 'my grievances', 'status'], 'citizen'),
  ('/citizen/course-registration', 'Course Registration', 'Register for PM-AJAY courses', ARRAY['course', 'register', 'training', 'enroll', 'education'], 'citizen'),
  ('/citizen/registrations', 'My Registrations', 'View course registration status', ARRAY['registrations', 'my courses', 'enrollment status'], 'citizen'),
  
  ('/agency-dashboard', 'Agency Dashboard', 'Agency portal dashboard', ARRAY['agency', 'dashboard', 'home'], 'agency'),
  ('/agency/proposals/submit', 'Submit Proposal', 'Submit a new project proposal', ARRAY['proposal', 'submit', 'project', 'new proposal'], 'agency'),
  ('/agency/proposals', 'My Proposals', 'View and track your proposals', ARRAY['proposals', 'my proposals', 'track', 'status'], 'agency'),
  ('/proposal', 'Create Proposal', 'Create project proposal', ARRAY['create', 'proposal', 'new'], 'agency'),
  
  ('/admin-dashboard', 'Admin Dashboard', 'Administrator dashboard', ARRAY['admin', 'dashboard', 'management'], 'admin'),
  ('/admin/grievances', 'Grievance Management', 'Manage citizen grievances', ARRAY['grievances', 'manage', 'review', 'complaints'], 'admin'),
  ('/admin/grant-reports', 'Grant Reports', 'View and manage grant reports', ARRAY['grants', 'reports', 'funding'], 'admin'),
  ('/admin/proposals', 'Proposal Review', 'Review agency proposals', ARRAY['proposals', 'review', 'approve', 'reject'], 'admin'),
  ('/admin/registrations', 'Registration Review', 'Review course registrations', ARRAY['registrations', 'review', 'courses', 'approve'], 'admin'),
  
  ('/map', 'Map View', 'Interactive map visualization', ARRAY['map', 'location', 'geography', 'visual'], 'public'),
  ('/mapping', 'Mapping', 'Data mapping and visualization', ARRAY['mapping', 'data', 'visualization'], 'public'),
  ('/transparency', 'Transparency Portal', 'View scheme transparency data', ARRAY['transparency', 'data', 'open', 'public'], 'public'),
  ('/comparison', 'Comparison', 'Compare scheme data', ARRAY['compare', 'comparison', 'data'], 'public'),
  ('/impact', 'Impact Metrics', 'View scheme impact metrics', ARRAY['impact', 'metrics', 'analytics', 'statistics'], 'public'),
  ('/about', 'About', 'About PM-AJAY scheme', ARRAY['about', 'info', 'information', 'scheme'], 'public')
ON CONFLICT (path) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_route_keywords ON route_index USING gin(keywords);