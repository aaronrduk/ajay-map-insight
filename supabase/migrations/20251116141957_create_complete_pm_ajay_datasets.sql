/*
  # Create Complete PM-AJAY Dataset Tables (15 total)

  ## 1. New Tables
  
  Creates 15 tables to store all PM-AJAY API data:
  - pm_ajay_dataset_1 through pm_ajay_dataset_15
  - Each table stores data as JSONB for flexibility
  - Includes unique hash for deduplication
  
  ## 2. Features
  - Flexible schema using JSONB
  - Hash-based deduplication
  - Sync tracking with timestamps
  - Indexed for performance
  - Public read access with RLS
*/

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS pm_ajay_dataset_8 CASCADE;
DROP TABLE IF EXISTS pm_ajay_dataset_9 CASCADE;
DROP TABLE IF EXISTS pm_ajay_dataset_10 CASCADE;
DROP TABLE IF EXISTS pm_ajay_dataset_11 CASCADE;
DROP TABLE IF EXISTS pm_ajay_dataset_12 CASCADE;
DROP TABLE IF EXISTS pm_ajay_dataset_13 CASCADE;
DROP TABLE IF EXISTS pm_ajay_dataset_14 CASCADE;
DROP TABLE IF EXISTS pm_ajay_dataset_15 CASCADE;

-- Create remaining dataset tables (1-7 already exist)
CREATE TABLE IF NOT EXISTS pm_ajay_dataset_8 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  record_hash text UNIQUE,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_9 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  record_hash text UNIQUE,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_10 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  record_hash text UNIQUE,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_11 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  record_hash text UNIQUE,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_12 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  record_hash text UNIQUE,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_13 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  record_hash text UNIQUE,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_14 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  record_hash text UNIQUE,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_ajay_dataset_15 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE,
  data jsonb NOT NULL,
  record_hash text UNIQUE,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add hash columns to existing tables if they don't have them
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pm_ajay_dataset_1' AND column_name = 'record_hash'
  ) THEN
    ALTER TABLE pm_ajay_dataset_1 ADD COLUMN record_hash text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pm_ajay_dataset_2' AND column_name = 'record_hash'
  ) THEN
    ALTER TABLE pm_ajay_dataset_2 ADD COLUMN record_hash text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pm_ajay_dataset_3' AND column_name = 'record_hash'
  ) THEN
    ALTER TABLE pm_ajay_dataset_3 ADD COLUMN record_hash text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pm_ajay_dataset_4' AND column_name = 'record_hash'
  ) THEN
    ALTER TABLE pm_ajay_dataset_4 ADD COLUMN record_hash text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pm_ajay_dataset_5' AND column_name = 'record_hash'
  ) THEN
    ALTER TABLE pm_ajay_dataset_5 ADD COLUMN record_hash text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pm_ajay_dataset_6' AND column_name = 'record_hash'
  ) THEN
    ALTER TABLE pm_ajay_dataset_6 ADD COLUMN record_hash text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pm_ajay_dataset_7' AND column_name = 'record_hash'
  ) THEN
    ALTER TABLE pm_ajay_dataset_7 ADD COLUMN record_hash text UNIQUE;
  END IF;
END $$;

-- Update sync metadata with all 15 datasets
INSERT INTO pm_ajay_sync_metadata (dataset_name, resource_id, last_sync_status) VALUES
  ('pm_ajay_dataset_1', '5040b4a2-b2ae-41b9-878d-bf657460fc68', 'pending'),
  ('pm_ajay_dataset_2', 'a915f63d-bc99-47d0-8471-018f6c5c39c2', 'pending'),
  ('pm_ajay_dataset_3', '7cff7e60-3cfc-40e2-8ef8-3354ed86dfc0', 'pending'),
  ('pm_ajay_dataset_4', 'e349b809-1722-4684-9981-fc8419abe17d', 'pending'),
  ('pm_ajay_dataset_5', '3e4319fb-3fe6-4169-9ac5-e2f18b8645e1', 'pending'),
  ('pm_ajay_dataset_6', 'f9f2ec91-c75f-4930-9c63-7bfed3c277e7', 'pending'),
  ('pm_ajay_dataset_7', 'd1e960e8-4058-4c33-aff8-c37e2189aef0', 'pending'),
  ('pm_ajay_dataset_8', '842f4e3f-bb32-450e-8387-45ebf5cda3f2', 'pending'),
  ('pm_ajay_dataset_9', '9bdf6219-38a0-4335-8b2c-2385fdae47b3', 'pending'),
  ('pm_ajay_dataset_10', 'ca6065cf-8f0c-49b1-bcc8-78faba03c0da', 'pending'),
  ('pm_ajay_dataset_11', '8b075576-a48f-44a7-8efa-2399e787c699', 'pending'),
  ('pm_ajay_dataset_12', 'd0063c23-5195-4377-9a5d-aa40e15cd486', 'pending'),
  ('pm_ajay_dataset_13', 'ecf91f8d-36b1-460d-b856-cb2d42725f47', 'pending'),
  ('pm_ajay_dataset_14', 'c4596021-dc87-43e7-84c5-1b6cf01fc9b3', 'pending'),
  ('pm_ajay_dataset_15', '0f6c1999-44d0-4ed3-b09d-432f8ca4d79f', 'pending')
ON CONFLICT (dataset_name) 
DO UPDATE SET 
  resource_id = EXCLUDED.resource_id,
  last_sync_status = 'pending';

-- Create indexes for performance on new tables
CREATE INDEX IF NOT EXISTS idx_dataset_8_data ON pm_ajay_dataset_8 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_9_data ON pm_ajay_dataset_9 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_10_data ON pm_ajay_dataset_10 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_11_data ON pm_ajay_dataset_11 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_12_data ON pm_ajay_dataset_12 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_13_data ON pm_ajay_dataset_13 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_14_data ON pm_ajay_dataset_14 USING gin(data);
CREATE INDEX IF NOT EXISTS idx_dataset_15_data ON pm_ajay_dataset_15 USING gin(data);

CREATE INDEX IF NOT EXISTS idx_dataset_8_hash ON pm_ajay_dataset_8(record_hash);
CREATE INDEX IF NOT EXISTS idx_dataset_9_hash ON pm_ajay_dataset_9(record_hash);
CREATE INDEX IF NOT EXISTS idx_dataset_10_hash ON pm_ajay_dataset_10(record_hash);
CREATE INDEX IF NOT EXISTS idx_dataset_11_hash ON pm_ajay_dataset_11(record_hash);
CREATE INDEX IF NOT EXISTS idx_dataset_12_hash ON pm_ajay_dataset_12(record_hash);
CREATE INDEX IF NOT EXISTS idx_dataset_13_hash ON pm_ajay_dataset_13(record_hash);
CREATE INDEX IF NOT EXISTS idx_dataset_14_hash ON pm_ajay_dataset_14(record_hash);
CREATE INDEX IF NOT EXISTS idx_dataset_15_hash ON pm_ajay_dataset_15(record_hash);

-- Enable RLS on new tables (public read access)
ALTER TABLE pm_ajay_dataset_8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_9 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_11 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_12 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_13 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_ajay_dataset_15 ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read dataset 8"
  ON pm_ajay_dataset_8 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 9"
  ON pm_ajay_dataset_9 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 10"
  ON pm_ajay_dataset_10 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 11"
  ON pm_ajay_dataset_11 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 12"
  ON pm_ajay_dataset_12 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 13"
  ON pm_ajay_dataset_13 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 14"
  ON pm_ajay_dataset_14 FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read dataset 15"
  ON pm_ajay_dataset_15 FOR SELECT
  USING (true);