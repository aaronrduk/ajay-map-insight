/*
  # Create Complete Course Registration System V2

  ## Summary
  Creates comprehensive course registration system with:
  - Sync metadata for courses/colleges
  - New course_registrations_v2 table (keeps old table intact)
  - Notifications system
  - Audit logging
  - File management
  
  ## Security
  - RLS on all tables
  - Role-based access control
*/

-- =====================================================
-- 1. SYNC METADATA TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sync_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id text UNIQUE NOT NULL,
  last_synced_at timestamptz,
  row_count integer DEFAULT 0,
  status text DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sync metadata"
  ON sync_metadata FOR SELECT
  USING (true);

-- =====================================================
-- 2. UPDATE COURSES TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'source_data') THEN
    ALTER TABLE courses ADD COLUMN source_data jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'record_hash') THEN
    ALTER TABLE courses ADD COLUMN record_hash text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'last_synced_at') THEN
    ALTER TABLE courses ADD COLUMN last_synced_at timestamptz;
  END IF;
END $$;

-- =====================================================
-- 3. UPDATE COLLEGES TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'colleges' AND column_name = 'source_data') THEN
    ALTER TABLE colleges ADD COLUMN source_data jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'colleges' AND column_name = 'record_hash') THEN
    ALTER TABLE colleges ADD COLUMN record_hash text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'colleges' AND column_name = 'last_synced_at') THEN
    ALTER TABLE colleges ADD COLUMN last_synced_at timestamptz;
  END IF;
END $$;

-- =====================================================
-- 4. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  read boolean DEFAULT false,
  type text DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 5. REGISTRATION AUDIT TABLE (for course_registrations_new)
-- =====================================================

CREATE TABLE IF NOT EXISTS registration_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL,
  actor_id uuid,
  actor_role text,
  action text NOT NULL,
  comment text,
  old_status text,
  new_status text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE registration_audit ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reg_audit_registration_id ON registration_audit(registration_id);
CREATE INDEX IF NOT EXISTS idx_reg_audit_created_at ON registration_audit(created_at DESC);

CREATE POLICY "Admins can view all audit logs"
  ON registration_audit FOR SELECT
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

-- =====================================================
-- 6. FILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  filename text NOT NULL,
  url text NOT NULL,
  mime_type text,
  size_bytes bigint,
  storage_path text,
  related_to text,
  related_id uuid,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_files_owner_id ON files(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_related ON files(related_to, related_id);

CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  TO authenticated
  USING (
    owner_id = (select auth.uid()) OR
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

CREATE POLICY "Users can upload files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

-- =====================================================
-- 7. ADD COLUMNS TO course_registrations_new
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_registrations_new' AND column_name = 'documents') THEN
    ALTER TABLE course_registrations_new ADD COLUMN documents jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_registrations_new' AND column_name = 'audit_log') THEN
    ALTER TABLE course_registrations_new ADD COLUMN audit_log jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_registrations_new' AND column_name = 'preferred_batch') THEN
    ALTER TABLE course_registrations_new ADD COLUMN preferred_batch text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_registrations_new' AND column_name = 'additional_info') THEN
    ALTER TABLE course_registrations_new ADD COLUMN additional_info text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_registrations_new' AND column_name = 'source') THEN
    ALTER TABLE course_registrations_new ADD COLUMN source text DEFAULT 'citizen' CHECK (source IN ('citizen', 'agency'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_registrations_new' AND column_name = 'agency_id') THEN
    ALTER TABLE course_registrations_new ADD COLUMN agency_id uuid;
  END IF;
END $$;

-- =====================================================
-- 8. CREATE AUDIT LOG TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION log_registration_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO registration_audit (
      registration_id,
      actor_id,
      action,
      comment,
      old_status,
      new_status,
      created_at
    ) VALUES (
      NEW.id,
      NEW.admin_user_id,
      'status_changed',
      NEW.admin_comment,
      OLD.status,
      NEW.status,
      now()
    );
    
    INSERT INTO notifications (
      user_id,
      title,
      body,
      link,
      type
    ) VALUES (
      NEW.user_id,
      'Registration Status Updated',
      'Your course registration status has been changed to: ' || NEW.status,
      '/citizen/registrations',
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS registration_audit_trigger ON course_registrations_new;

CREATE TRIGGER registration_audit_trigger
  AFTER UPDATE ON course_registrations_new
  FOR EACH ROW
  EXECUTE FUNCTION log_registration_audit();

-- =====================================================
-- 9. SEED SYNC METADATA
-- =====================================================

INSERT INTO sync_metadata (resource_id, status) VALUES
  ('courses', 'pending'),
  ('colleges', 'pending')
ON CONFLICT (resource_id) DO NOTHING;