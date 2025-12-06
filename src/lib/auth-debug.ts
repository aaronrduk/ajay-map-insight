import { supabase } from "@/integrations/supabase/client";

export const debugRegistrationOTP = async (email: string, otp: string) => {
  console.log('=== REGISTRATION OTP DEBUG START ===');
  console.log('Input:', { email, otp });

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.trim();

  console.log('Cleaned:', { cleanEmail, cleanOtp });

  // Step 1: Check if OTP exists
  console.log('\n1. Checking if OTP exists in database...');
  const { data: allOTPs, error: allError } = await supabase
    .from('otp_store')
    .select('*')
    .eq('email', cleanEmail)
    .eq('otp_type', 'registration');

  console.log('All OTPs for this email:', allOTPs);
  console.log('Query error:', allError);

  // Step 2: Check specific OTP
  console.log('\n2. Checking specific OTP...');
  const { data: specificOTP, error: specificError } = await supabase
    .from('otp_store')
    .select('*')
    .eq('email', cleanEmail)
    .eq('otp', cleanOtp)
    .eq('otp_type', 'registration');

  console.log('Matching OTPs:', specificOTP);
  console.log('Query error:', specificError);

  if (specificOTP && specificOTP.length > 0) {
    const otp = specificOTP[0];
    console.log('\n3. OTP Details:');
    console.log('  - OTP:', otp.otp);
    console.log('  - Email:', otp.email);
    console.log('  - Is Used:', otp.is_used);
    console.log('  - Expires At:', otp.expires_at);
    console.log('  - Current Time:', new Date().toISOString());
    console.log('  - Is Expired:', new Date(otp.expires_at) < new Date());
    console.log('  - User Data:', otp.user_data);
  }

  // Step 3: Try to find valid OTP
  console.log('\n4. Checking valid OTP (not used, not expired)...');
  const { data: validOTP, error: validError } = await supabase
    .from('otp_store')
    .select('*')
    .eq('email', cleanEmail)
    .eq('otp', cleanOtp)
    .eq('otp_type', 'registration')
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log('Valid OTP found:', !!validOTP);
  console.log('Valid OTP data:', validOTP);
  console.log('Query error:', validError);

  // Step 4: Try to create user
  if (validOTP) {
    console.log('\n5. Attempting to create user...');
    const userData = validOTP.user_data as any;
    console.log('User data from OTP:', userData);

    try {
      const { data: newUser, error: userError } = await supabase
        .from('portal_users')
        .insert({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          user_type: userData.user_type,
          is_verified: true,
        })
        .select()
        .single();

      console.log('User creation result:', newUser);
      console.log('User creation error:', userError);

      if (userError) {
        console.error('ERROR DETAILS:');
        console.error('  - Code:', userError.code);
        console.error('  - Message:', userError.message);
        console.error('  - Details:', userError.details);
        console.error('  - Hint:', userError.hint);
      }

      if (newUser) {
        console.log('\n6. User created successfully!');
        console.log('  - ID:', newUser.id);
        console.log('  - Email:', newUser.email);
        console.log('  - Type:', newUser.user_type);

        // Mark OTP as used
        const { error: updateError } = await supabase
          .from('otp_store')
          .update({ is_used: true })
          .eq('id', validOTP.id);

        console.log('OTP marked as used:', !updateError);
        console.log('Update error:', updateError);
      }
    } catch (error) {
      console.error('Exception during user creation:', error);
    }
  }

  console.log('\n=== REGISTRATION OTP DEBUG END ===');
};

// Quick test function to call from console
(window as any).debugOTP = debugRegistrationOTP;
