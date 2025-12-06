# OTP Registration Debugging Guide

## Issue
Registration OTP verification is failing. This guide will help you identify the exact issue.

## Quick Debug Steps

### Step 1: Check Browser Console
When you try to register and verify OTP, the browser console will automatically show:
```javascript
Verifying OTP: { email: "user@example.com", otp: "123456", type: "registration" }
OTP query result: { found: true/false, error: null/error }
```

### Step 2: Use the Debug Function
Open your browser console and run:
```javascript
await window.debugOTP('youremail@example.com', '123456')
```

This will show:
- ✓ If the OTP exists in database
- ✓ If the email matches
- ✓ If the OTP is used or expired
- ✓ The exact error when creating the user
- ✓ Full step-by-step execution details

### Step 3: Common Issues and Solutions

#### Issue A: "Invalid or expired OTP"
**Check:**
```javascript
// Run in browser console:
await window.debugOTP('your@email.com', 'your-otp')
```

**Look for:**
- `Is Expired: true` → OTP has expired (> 10 minutes old)
- `Is Used: true` → OTP already used
- `Matching OTPs: []` → OTP doesn't exist or wrong email/OTP

**Solution:**
- Request new OTP if expired or used
- Check for typos in email or OTP
- Verify email is lowercase (automatic in code)

#### Issue B: "Database error" or User Creation Fails
**Check RLS Policies:**
```sql
-- Run in Supabase SQL Editor
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'portal_users';
```

**Expected Result:**
- Policy: "Public can register new users"
- Command: INSERT
- With Check: true

**If missing, add policy:**
```sql
CREATE POLICY "Public can register new users"
ON portal_users FOR INSERT
TO public
WITH CHECK (true);
```

#### Issue C: Email Already Exists
**Check:**
```sql
SELECT email FROM portal_users WHERE email = 'your@email.com';
```

**If exists:** User already registered, try login instead.

**Solution:**
```sql
-- Only if this is a test account you want to remove:
DELETE FROM portal_users WHERE email = 'your@email.com';
DELETE FROM otp_store WHERE email = 'your@email.com';
```

## Manual Testing

### Test 1: Generate OTP
1. Fill registration form
2. Click "Register"
3. Check browser console for: `OTP for youremail@example.com: 123456`

### Test 2: Verify OTP in Database
```sql
SELECT
  otp,
  is_used,
  expires_at,
  CASE
    WHEN expires_at < NOW() THEN 'EXPIRED'
    WHEN is_used THEN 'USED'
    ELSE 'VALID'
  END as status
FROM otp_store
WHERE email = 'your@email.com'
  AND otp_type = 'registration'
ORDER BY created_at DESC
LIMIT 1;
```

### Test 3: Manually Verify
```javascript
// In browser console:
import { verifyRegistrationOTP } from './src/lib/auth-service';
const result = await verifyRegistrationOTP('your@email.com', '123456');
console.log(result);
```

## Environment Check

### Verify Supabase Connection
```javascript
// In browser console:
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
```

Expected:
- URL: `https://your-project.supabase.co`
- Key: `Present`

### Test Database Connection
```javascript
// In browser console:
import { supabase } from './src/integrations/supabase/client';
const { data, error } = await supabase.from('otp_store').select('count');
console.log('Connection:', error ? 'Failed' : 'Success', data);
```

## Real-World Example

```javascript
// Scenario: User registers with email "test@example.com"

// 1. Registration initiated
await initiateRegistration({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  userType: 'citizen'
});
// Console shows: "OTP for test@example.com: 798654"

// 2. Debug the OTP
await window.debugOTP('test@example.com', '798654');
// Shows complete flow and any errors

// 3. If successful, user is created and can login
// If failed, debug output shows exact issue
```

## Production Fixes

### Fix 1: Clean Email Input
Already implemented - emails are automatically:
- Trimmed (removes spaces)
- Lowercased

### Fix 2: Better Error Messages
Already implemented - specific messages for:
- Expired OTP
- Used OTP
- Invalid OTP
- Database errors

### Fix 3: Detailed Logging
Already implemented - console logs show:
- What's being verified
- If OTP was found
- Any errors that occur

## Support Commands

### Clean Test Data
```sql
-- Remove test OTPs older than 1 hour
DELETE FROM otp_store
WHERE created_at < NOW() - INTERVAL '1 hour';

-- Remove test users (CAREFUL!)
DELETE FROM portal_users
WHERE email LIKE '%test%' OR email LIKE '%example.com';
```

### Check Current State
```sql
-- Active OTPs
SELECT email, otp, expires_at, is_used,
  EXTRACT(EPOCH FROM (expires_at - NOW()))/60 as minutes_left
FROM otp_store
WHERE expires_at > NOW() AND is_used = false
ORDER BY created_at DESC;

-- Recent registrations
SELECT email, user_type, is_verified, created_at
FROM portal_users
ORDER BY created_at DESC
LIMIT 10;
```

## Contact/Next Steps

If OTP verification still fails after debugging:
1. Run `window.debugOTP('your@email.com', 'your-otp')` in browser console
2. Copy the complete console output
3. Check for the specific error message
4. Verify RLS policies are correct
5. Ensure Supabase environment variables are set correctly
