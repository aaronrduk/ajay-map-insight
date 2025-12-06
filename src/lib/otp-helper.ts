import { supabase } from "@/integrations/supabase/client";

export const cleanupExpiredOTPs = async () => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('otp_store')
      .delete()
      .lt('expires_at', now);

    if (error) {
      console.error('Failed to cleanup expired OTPs:', error);
      return false;
    }

    console.log('Expired OTPs cleaned up successfully');
    return true;
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
    return false;
  }
};

export const debugOTP = async (email: string, otpType: 'registration' | 'login') => {
  try {
    const cleanEmail = email.toLowerCase().trim();

    const { data: allOTPs, error } = await supabase
      .from('otp_store')
      .select('*')
      .eq('email', cleanEmail)
      .eq('otp_type', otpType)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Debug query error:', error);
      return null;
    }

    console.log('=== OTP DEBUG INFO ===');
    console.log('Email:', cleanEmail);
    console.log('Type:', otpType);
    console.log('Current Time:', new Date().toISOString());
    console.log('Found OTPs:', allOTPs?.length || 0);

    if (allOTPs && allOTPs.length > 0) {
      allOTPs.forEach((otp, index) => {
        const isExpired = new Date(otp.expires_at) < new Date();
        const timeLeft = isExpired ? 'EXPIRED' : `${Math.round((new Date(otp.expires_at).getTime() - Date.now()) / 1000)}s`;

        console.log(`\nOTP #${index + 1}:`);
        console.log('  Code:', otp.otp);
        console.log('  Status:', otp.is_used ? 'USED' : 'AVAILABLE');
        console.log('  Expires:', otp.expires_at);
        console.log('  Time Left:', timeLeft);
        console.log('  Created:', otp.created_at);
      });
    } else {
      console.log('No OTPs found for this email and type');
    }
    console.log('=====================');

    return allOTPs;
  } catch (error) {
    console.error('Error debugging OTP:', error);
    return null;
  }
};

export const getLatestValidOTP = async (email: string, otpType: 'registration' | 'login') => {
  try {
    const cleanEmail = email.toLowerCase().trim();

    const { data: otp, error } = await supabase
      .from('otp_store')
      .select('otp, expires_at, is_used')
      .eq('email', cleanEmail)
      .eq('otp_type', otpType)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest OTP:', error);
      return null;
    }

    return otp;
  } catch (error) {
    console.error('Error getting latest OTP:', error);
    return null;
  }
};

export const validateOTPFormat = (otp: string): { valid: boolean; message?: string } => {
  const cleaned = otp.trim();

  if (!cleaned) {
    return { valid: false, message: 'OTP cannot be empty' };
  }

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'OTP must contain only numbers' };
  }

  if (cleaned.length !== 6) {
    return { valid: false, message: 'OTP must be exactly 6 digits' };
  }

  return { valid: true };
};

export const formatOTPInput = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 6);
};
