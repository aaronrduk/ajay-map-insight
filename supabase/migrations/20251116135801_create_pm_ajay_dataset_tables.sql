/*
  # Create PM-AJAY Dataset Tables

  ## 1. New Tables
  
  Creates 7 tables to store PM-AJAY API data:
  - pm_ajay_dataset_1 through pm_ajay_dataset_7
  - Each table stores data as JSONB for flexibility
  - Includes sync metadata table
  
  ## 2. Features
  - Flexible schema using JSONB
  - Unique constraints to prevent duplicates
  - Sync tracking with timestamps
  - Indexed for performance
*/

-- Create sync metadata table
CREATE TABLE IF NOT EXISTS pm_ajay_sync_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_name text UNIQUE NOT NULL,
  resource_id text NOT NULL,
  last_sync_at timestamptz,
  last_sync_status text DEFAULT 'pending',
  last_sync_error text,
  total_records integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dataset tables with JSONB for flexibility
CREATE TABLE IF NOT EXISTS pm_ajay_dataset_1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_3 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_4 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_5 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_6 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_7 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Initialize sync metadata
INSERT INTO pm_ajay_sync_metadata (dataset_name, resource_id, last_sync_status) VALUES
  ('pm_ajay_dataset_1', '9bdf6219-38a0-4335-8b2c-2385fdae47b3', 'pending'),
  ('pm_ajay_dataset_2', 'ca6065cf-8f0c-49b1-bcc8-78faba03c0da', 'pending'),
  ('pm_ajay_dataset_3', '8b075576-a48f-44a7-8efa-2399e787c699', 'pending'),
  ('pm_ajay_dataset_4', 'd0063c23-5195-4377-9a5d-aa40e15cd486', 'pending'),
  ('pm_ajay_dataset_5', 'ecf91f8d-36b1-460d-b856-cb2d42725f47', 'pending'),
  ('pm_ajay_dataset_6', 'c4596021-dc87-43e7-84c5-1b6cf01fc9b3', 'pending'),
  ('pm_ajay_dataset_7', '0f6c1999-44d0-4ed3-b09d-432f8ca4d79f', 'pending')
ON CONFLICT (dataset_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dataset_1_data ON pm_ajay_dataset_1 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_2_data ON pm_ajay_dataset_2 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_3_data ON pm_ajay_dataset_3 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_4_data ON pm_ajay_dataset_4 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_5_data ON pm_ajay_dataset_5 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_6_data ON pm_ajay_dataset_6 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_7_data ON pm_ajay_dataset_7 USING gin(data);

-- Enable RLS (public read access, admin only write)
ALTER TABLE pm_ajay_sync_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_5 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_6 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_7 ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read sync metadata"
  ON pm_ajay_sync_metadata FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 1"
  ON pm_ajay_dataset_1 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 2"
  ON pm_ajay_dataset_2 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 3"
  ON pm_ajay_dataset_3 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 4"
  ON pm_ajay_dataset_4 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 5"
  ON pm_ajay_dataset_5 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 6"
  ON pm_ajay_dataset_6 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 7"
  ON pm_ajay_dataset_7 FOR SELECT
  USING (true);