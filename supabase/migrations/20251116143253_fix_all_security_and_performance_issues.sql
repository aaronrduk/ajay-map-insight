/*
  # Fix All Security and Performance Issues

  ## 1. Add Missing Foreign Key Indexes
  - Creates indexes on all unindexed foreign keys for optimal query performance
  
  ## 2. Fix RLS Performance Issues
  - Replaces auth.uid() with (select auth.uid()) to prevent per-row re-evaluation
  - Improves query performance at scale
  
  ## 3. Fix Multiple Permissive Policies
  - Consolidates duplicate policies to avoid conflicts
  
  ## 4. Note on Indexes
  - Unused indexes are kept as they're needed for production scale
  - GIN indexes essential for JSONB queries
  - Hash indexes critical for deduplication
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_agency_proposals_admin_user_id 
  ON agency_proposals(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_college_courses_course_id 
  ON college_courses(course_id);

CREATE INDEX IF NOT EXISTS idx_course_registrations_course_id 
  ON course_registrations(course_id);

CREATE INDEX IF NOT EXISTS idx_course_registrations_new_admin_user_id 
  ON course_registrations_new(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_course_registrations_new_college_id 
  ON course_registrations_new(college_id);

CREATE INDEX IF NOT EXISTS idx_course_registrations_new_course_id_fk 
  ON course_registrations_new(course_id);

-- Add user_id indexes for common WHERE clauses
CREATE INDEX IF NOT EXISTS idx_agency_proposals_user_id 
  ON agency_proposals(user_id);

CREATE INDEX IF NOT EXISTS idx_course_registrations_new_user_id 
  ON course_registrations_new(user_id);

CREATE INDEX IF NOT EXISTS idx_eligibility_checks_user_id 
  ON eligibility_checks(user_id);

CREATE INDEX IF NOT EXISTS idx_grievances_user_id 
  ON grievances(user_id);

-- =====================================================
-- 2. FIX RLS PERFORMANCE - grievances
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can update own grievances" ON grievances;

CREATE POLICY "Authenticated users can update own grievances"
  ON grievances FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 3. FIX RLS PERFORMANCE - portal_users
-- =====================================================

DROP POLICY IF EXISTS "Users can view own data" ON portal_users;
DROP POLICY IF EXISTS "Users can update own data" ON portal_users;
DROP POLICY IF EXISTS "Public can view verified users" ON portal_users;

CREATE POLICY "View user data"
  ON portal_users FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid()) OR
    is_verified = true OR
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

CREATE POLICY "Users can update own data"
  ON portal_users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- 4. FIX RLS PERFORMANCE - eligibility_checks
-- =====================================================

DROP POLICY IF EXISTS "Users can view own eligibility checks" ON eligibility_checks;
DROP POLICY IF EXISTS "Admins can view all eligibility checks" ON eligibility_checks;

CREATE POLICY "View eligibility checks"
  ON eligibility_checks FOR SELECT
  USING (
    user_id = (select auth.uid()) OR
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

-- =====================================================
-- 5. FIX RLS PERFORMANCE - agency_proposals
-- =====================================================

DROP POLICY IF EXISTS "Agencies can view own proposals" ON agency_proposals;
DROP POLICY IF EXISTS "Agencies can create proposals" ON agency_proposals;
DROP POLICY IF EXISTS "Admins can view all proposals" ON agency_proposals;
DROP POLICY IF EXISTS "Admins can update proposals" ON agency_proposals;

CREATE POLICY "View proposals"
  ON agency_proposals FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

CREATE POLICY "Create proposals"
  ON agency_proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid()) AND
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) IN ('agency', 'admin')
  );

CREATE POLICY "Update proposals"
  ON agency_proposals FOR UPDATE
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  )
  WITH CHECK (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

-- =====================================================
-- 6. FIX RLS PERFORMANCE - course_registrations_new
-- =====================================================

DROP POLICY IF EXISTS "Citizens can view own registrations" ON course_registrations_new;
DROP POLICY IF EXISTS "Citizens can create registrations" ON course_registrations_new;
DROP POLICY IF EXISTS "Admins can view all registrations" ON course_registrations_new;
DROP POLICY IF EXISTS "Admins can update registrations" ON course_registrations_new;

CREATE POLICY "View registrations"
  ON course_registrations_new FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

CREATE POLICY "Create registrations"
  ON course_registrations_new FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid()) AND
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) IN ('citizen', 'admin')
  );

CREATE POLICY "Update registrations"
  ON course_registrations_new FOR UPDATE
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  )
  WITH CHECK (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

-- =====================================================
-- 7. FIX MULTIPLE POLICIES - agencies
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view agencies" ON agencies;
DROP POLICY IF EXISTS "Authenticated users can manage agencies" ON agencies;

CREATE POLICY "View agencies"
  ON agencies FOR SELECT
  USING (true);

CREATE POLICY "Manage agencies"
  ON agencies FOR ALL
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  )
  WITH CHECK (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );

-- =====================================================
-- 8. FIX MULTIPLE POLICIES - grant_eligibility_criteria
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view grant criteria" ON grant_eligibility_criteria;
DROP POLICY IF EXISTS "Authenticated users can manage criteria" ON grant_eligibility_criteria;

CREATE POLICY "View grant criteria"
  ON grant_eligibility_criteria FOR SELECT
  USING (true);

CREATE POLICY "Manage grant criteria"
  ON grant_eligibility_criteria FOR ALL
  TO authenticated
  USING (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  )
  WITH CHECK (
    (select (raw_user_meta_data->>'user_type')::text FROM auth.users WHERE id = (select auth.uid())) = 'admin'
  );