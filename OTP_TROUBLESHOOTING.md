# OTP Verification Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Invalid or expired OTP"

**Possible Causes:**
1. OTP has expired (10 minute validity)
2. OTP was already used
3. Incorrect OTP entered
4. Extra spaces in OTP or email
5. Email mismatch between registration and verification

**Solutions:**
```typescript
// Check browser console for debug logs
// Look for:
// - "Verifying OTP:" - Shows what's being verified
// - "OTP query result:" - Shows if OTP was found

// If OTP not found, debug with:
import { debugOTP } from '@/lib/otp-helper';
await debugOTP('user@example.com', 'registration');
```

### Issue 2: OTP Not Found in Database

**Check:**
```sql
-- Run this query in Supabase SQL Editor
SELECT * FROM otp_store
WHERE email = 'user@example.com'
ORDER BY created_at DESC
LIMIT 5;
```

**Verify:**
- Email is lowercase and trimmed
- OTP type matches ('registration' or 'login')
- OTP hasn't expired
- OTP hasn't been used (is_used = false)

### Issue 3: OTP Already Used

**Error Message:** "This OTP has already been used. Please request a new one."

**Cause:** The OTP was successfully verified once and marked as used.

**Solution:** Request a new OTP using the "Resend OTP" button.

### Issue 4: OTP Expired

**Error Message:** "OTP has expired. Please request a new one."

**Cause:** More than 10 minutes have passed since OTP was generated.

**Solution:** Request a new OTP - they expire for security.

## Developer Tools

### 1. Debug OTP Issues

```typescript
import { debugOTP, getLatestValidOTP } from '@/lib/otp-helper';

// Show all recent OTPs for debugging
await debugOTP('user@example.com', 'registration');

// Get the latest valid OTP (for development only!)
const otp = await getLatestValidOTP('user@example.com', 'registration');
console.log('Latest valid OTP:', otp?.otp);
```

### 2. Cleanup Expired OTPs

```typescript
import { cleanupExpiredOTPs } from '@/lib/otp-helper';

// Remove all expired OTPs from database
await cleanupExpiredOTPs();
```

### 3. Validate OTP Format

```typescript
import { validateOTPFormat, formatOTPInput } from '@/lib/otp-helper';

// Validate OTP format before submission
const validation = validateOTPFormat(userInput);
if (!validation.valid) {
  console.error(validation.message);
}

// Auto-format OTP input (remove non-digits, limit to 6)
const formatted = formatOTPInput('12 34 56');
console.log(formatted); // "123456"
```

## Testing OTP Flow

### Manual Testing Steps:

1. **Registration Flow:**
```typescript
// Step 1: Initiate registration
const result = await initiateRegistration({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  userType: 'citizen'
});

// Step 2: Check console for OTP
// Console output: "OTP for test@example.com: 123456"

// Step 3: Verify OTP
const verifyResult = await verifyRegistrationOTP(
  'test@example.com',
  '123456'
);
```

2. **Login Flow:**
```typescript
// Step 1: Initiate login
const result = await initiateLogin(
  'test@example.com',
  'password123',
  'citizen'
);

// Step 2: Check console for OTP
// Console output: "Login OTP for test@example.com: 654321"

// Step 3: Verify OTP
const verifyResult = await verifyLoginOTP(
  'test@example.com',
  '654321'
);
```

## Console Debug Logs

When verifying OTP, check browser console for:

```javascript
// Example successful verification:
Verifying OTP: { email: "user@example.com", otp: "123456", type: "registration" }
OTP query result: { found: true, error: null }

// Example failed verification:
Verifying OTP: { email: "user@example.com", otp: "999999", type: "registration" }
OTP query result: { found: false, error: null }
```

## Database Queries for Debugging

### Check OTP Store:
```sql
SELECT
  email,
  otp,
  otp_type,
  is_used,
  expires_at,
  created_at,
  CASE
    WHEN expires_at < NOW() THEN 'EXPIRED'
    WHEN is_used = true THEN 'USED'
    ELSE 'VALID'
  END as status
FROM otp_store
WHERE email = 'user@example.com'
ORDER BY created_at DESC
LIMIT 10;
```

### Check User Created Successfully:
```sql
SELECT id, name, email, user_type, is_verified, created_at
FROM portal_users
WHERE email = 'user@example.com';
```

### Clean Up Test Data:
```sql
-- Remove test OTPs
DELETE FROM otp_store WHERE email LIKE '%test%';

-- Remove test users (be careful!)
DELETE FROM portal_users WHERE email LIKE '%test%';
```

## Best Practices

1. **Always Trim Input:**
   - Email and OTP inputs are automatically trimmed
   - This prevents "invisible" space characters from causing issues

2. **Use Lowercase Emails:**
   - All emails are normalized to lowercase
   - Prevents case-sensitivity issues

3. **Check Expiration:**
   - OTPs expire after 10 minutes
   - Always request new OTP if too much time has passed

4. **One-Time Use:**
   - OTPs are marked as used after successful verification
   - Cannot reuse the same OTP

5. **Console Logging:**
   - OTPs are logged to console in development
   - Check console if email delivery fails

## Production Considerations

### Security:
- Remove console.log statements for OTP codes
- Implement rate limiting for OTP requests
- Consider SMS as backup for email delivery
- Add CAPTCHA to prevent abuse

### User Experience:
- Show countdown timer for OTP expiration
- Auto-format OTP input (spaces every 2 digits)
- Add "Resend OTP" button with cooldown
- Provide clear error messages

### Monitoring:
- Log OTP generation and verification attempts
- Monitor success/failure rates
- Alert on unusual patterns
- Track time between generation and verification

## Contact

If OTP verification continues to fail after trying these solutions:
1. Check browser console for specific error messages
2. Use the debug tools provided
3. Verify database connectivity
4. Check Supabase logs for errors
