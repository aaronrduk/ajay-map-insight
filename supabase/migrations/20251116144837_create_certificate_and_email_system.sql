/*
  # Create Certificate and Email System

  ## Summary
  Complete system for:
  - Certificate generation and management
  - Email notifications and broadcasts
  - Mass email system
  - Enhanced audit logging
  
  ## New Tables
  1. certificates - Digital certificates with QR codes
  2. email_broadcasts - Mass email system
  3. email_logs - Email delivery tracking
  
  ## Updates
  - Enhanced notifications table
  - Add certificate verification endpoint data
*/

-- =====================================================
-- 1. CERTIFICATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES course_registrations_new(id) ON DELETE CASCADE,
  citizen_id uuid NOT NULL,
  certificate_number text UNIQUE NOT NULL,
  certificate_url text,
  qr_code_data text,
  course_name text NOT NULL,
  college_name text NOT NULL,
  issued_at timestamptz DEFAULT now(),
  issued_by uuid,
  verification_code text UNIQUE,
  metadata jsonb DEFAULT '{}'::jsonb,
  revoked boolean DEFAULT false,
  revoked_at timestamptz,
  revoked_by uuid,
  revoked_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_certificates_citizen ON certificates(citizen_id);
CREATE INDEX IF NOT EXISTS idx_certificates_registration ON certificates(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_verification ON certificates(verification_code);

CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    citizen_id = (select auth.uid()) OR
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

CREATE POLICY "Admins can manage certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  )
  WITH CHECK (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

-- =====================================================
-- 2. EMAIL BROADCASTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS email_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  recipient_filter text,
  attachment_url text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  total_recipients integer DEFAULT 0,
  total_sent integer DEFAULT 0,
  total_failed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_email_broadcasts_admin ON email_broadcasts(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_broadcasts_status ON email_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_email_broadcasts_scheduled ON email_broadcasts(scheduled_at);

CREATE POLICY "Admins can manage broadcasts"
  ON email_broadcasts FOR ALL
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  )
  WITH CHECK (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

-- =====================================================
-- 3. EMAIL LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_broadcast_id uuid REFERENCES email_broadcasts(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_email_logs_broadcast ON email_logs(email_broadcast_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

-- =====================================================
-- 4. ENHANCE NOTIFICATIONS TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
    ALTER TABLE notifications ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'category') THEN
    ALTER TABLE notifications ADD COLUMN category text DEFAULT 'general';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
    ALTER TABLE notifications ADD COLUMN priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;
END $$;

-- =====================================================
-- 5. CERTIFICATE VERIFICATION VIEW
-- =====================================================

CREATE OR REPLACE VIEW certificate_verification AS
SELECT 
  c.id,
  c.certificate_number,
  c.verification_code,
  c.course_name,
  c.college_name,
  c.issued_at,
  c.revoked,
  c.revoked_reason,
  pu.name as citizen_name,
  pu.email as citizen_email,
  cr.status as registration_status
FROM certificates c
LEFT JOIN portal_users pu ON c.citizen_id = pu.id
LEFT JOIN course_registrations_new cr ON c.registration_id = cr.id;

-- =====================================================
-- 6. FUNCTION TO GENERATE CERTIFICATE NUMBER
-- =====================================================

CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS text AS $$
DECLARE
  year_month text;
  random_suffix text;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8));
  RETURN 'PMAJAY-' || year_month || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNCTION TO GENERATE VERIFICATION CODE
-- =====================================================

CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS text AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::text || NOW()::text) FROM 1 FOR 16));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGER TO AUTO-GENERATE CERTIFICATE ON APPROVAL
-- =====================================================

CREATE OR REPLACE FUNCTION auto_generate_certificate()
RETURNS TRIGGER AS $$
DECLARE
  course_name_val text;
  college_name_val text;
  cert_number text;
  verif_code text;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted') THEN
    SELECT c.course_name INTO course_name_val
    FROM courses c
    WHERE c.id = NEW.course_id;
    
    SELECT col.name INTO college_name_val
    FROM colleges col
    WHERE col.id = NEW.college_id;
    
    cert_number := generate_certificate_number();
    verif_code := generate_verification_code();
    
    INSERT INTO certificates (
      registration_id,
      citizen_id,
      certificate_number,
      verification_code,
      course_name,
      college_name,
      issued_by,
      issued_at
    ) VALUES (
      NEW.id,
      NEW.user_id,
      cert_number,
      verif_code,
      COALESCE(course_name_val, 'Unknown Course'),
      COALESCE(college_name_val, 'Unknown College'),
      NEW.admin_user_id,
      NOW()
    );
    
    INSERT INTO notifications (
      user_id,
      title,
      body,
      link,
      type,
      category,
      priority
    ) VALUES (
      NEW.user_id,
      'Certificate Issued!',
      'Your course registration has been approved and your certificate is ready for download.',
      '/citizen/certificates',
      'success',
      'certificate',
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_certificate_trigger ON course_registrations_new;

CREATE TRIGGER auto_certificate_trigger
  AFTER UPDATE ON course_registrations_new
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_certificate();

-- =====================================================
-- 9. PM-AJAY SYNC LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS pm_ajay_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id text NOT NULL,
  dataset_number integer,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  status text DEFAULT 'running',
  rows_inserted integer DEFAULT 0,
  rows_updated integer DEFAULT 0,
  rows_skipped integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_resource ON pm_ajay_sync_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started ON pm_ajay_sync_logs(started_at DESC);

ALTER TABLE pm_ajay_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON pm_ajay_sync_logs FOR SELECT
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );