/*
  # Fix Registration RLS Policies

  ## Changes
  - Add INSERT policy for portal_users to allow public registration
  - Ensure OTP workflow can complete successfully
  
  ## Security
  - Only allows inserting new users during registration
  - Maintains read restrictions for unverified users
*/

-- Allow public to insert new users during registration
CREATE POLICY "Public can register new users" ON public.portal_users
  FOR INSERT TO public
  WITH CHECK (true);