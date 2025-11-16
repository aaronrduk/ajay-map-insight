// PM AJAY Portal Authentication Service
// Handles user registration, login, and OTP verification

import { supabase } from "@/integrations/supabase/client";

export interface UserData {
  name: string;
  email: string;
  password: string;
  userType: 'administrator' | 'agency' | 'citizen';
}

export interface OTPResponse {
  success: boolean;
  message: string;
  requiresOTP?: boolean;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    userType: string;
  };
  redirectTo?: string;
}

// Hash password (in production, use bcrypt on backend)
const hashPassword = (password: string): string => {
  // Simple hash for demo - in production use proper bcrypt
  return btoa(password);
};

// Check if email exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('portal_users')
    .select('email')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  return !!data;
};

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user - Step 1: Send OTP
export const initiateRegistration = async (userData: UserData): Promise<OTPResponse> => {
  try {
    // Check if email already exists
    const exists = await checkEmailExists(userData.email);
    if (exists) {
      return {
        success: false,
        message: 'Email already registered. Please login instead.',
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP and pending registration data
    const { error: otpError } = await supabase
      .from('otp_store')
      .insert({
        email: userData.email.toLowerCase(),
        otp,
        otp_type: 'registration',
        user_data: {
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: hashPassword(userData.password),
          user_type: userData.userType,
        },
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (otpError) throw otpError;

    // Send OTP via email
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: {
          to: userData.email,
          otp,
          type: 'registration',
          name: userData.name
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
      } else {
        console.log('Email sent:', emailData);
      }
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
    }

    // Also log to console for development
    console.log(`OTP for ${userData.email}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent to your email. Please check and verify.',
      requiresOTP: true,
      email: userData.email,
    };
  } catch (error) {
    console.error('Registration initiation error:', error);
    return {
      success: false,
      message: 'Failed to initiate registration. Please try again.',
    };
  }
};

// Verify registration OTP and create user
export const verifyRegistrationOTP = async (
  email: string,
  otp: string
): Promise<LoginResponse> => {
  try {
    // Find valid OTP
    const { data: otpData, error: otpError } = await supabase
      .from('otp_store')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('otp', otp)
      .eq('otp_type', 'registration')
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpData) {
      return {
        success: false,
        message: 'Invalid or expired OTP. Please try again.',
      };
    }

    // Create user from stored data
    const userData = otpData.user_data as any;
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

    if (userError) throw userError;

    // Mark OTP as used
    await supabase
      .from('otp_store')
      .update({ is_used: true })
      .eq('id', otpData.id);

    // Determine redirect based on user type
    const redirectMap = {
      administrator: '/admin-dashboard',
      agency: '/agency-dashboard',
      citizen: '/citizen-dashboard',
    };

    return {
      success: true,
      message: 'Registration successful! Redirecting...',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.user_type,
      },
      redirectTo: redirectMap[newUser.user_type as keyof typeof redirectMap],
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      message: 'Verification failed. Please try again.',
    };
  }
};

// Login - Step 1: Validate credentials and send OTP
export const initiateLogin = async (
  email: string,
  password: string,
  userType: string
): Promise<OTPResponse> => {
  try {
    // Find user
    const { data: user, error } = await supabase
      .from('portal_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('user_type', userType)
      .maybeSingle();

    if (error || !user) {
      return {
        success: false,
        message: 'Invalid email or user type.',
      };
    }

    // Verify password
    if (user.password !== hashPassword(password)) {
      return {
        success: false,
        message: 'Invalid password.',
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    const { error: otpError } = await supabase
      .from('otp_store')
      .insert({
        email: user.email,
        otp,
        otp_type: 'login',
        user_data: { user_id: user.id, user_type: user.user_type },
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (otpError) throw otpError;

    // Send OTP via email
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: {
          to: user.email,
          otp,
          type: 'login',
          name: user.name
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
      } else {
        console.log('Email sent:', emailData);
      }
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
    }

    // Also log to console for development
    console.log(`Login OTP for ${user.email}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent to your email. Please verify to login.',
      requiresOTP: true,
      email: user.email,
    };
  } catch (error) {
    console.error('Login initiation error:', error);
    return {
      success: false,
      message: 'Login failed. Please try again.',
    };
  }
};

// Verify login OTP
export const verifyLoginOTP = async (
  email: string,
  otp: string
): Promise<LoginResponse> => {
  try {
    // Find valid OTP
    const { data: otpData, error: otpError } = await supabase
      .from('otp_store')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('otp', otp)
      .eq('otp_type', 'login')
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpData) {
      return {
        success: false,
        message: 'Invalid or expired OTP. Please try again.',
      };
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('portal_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    // Update last login
    await supabase
      .from('portal_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Mark OTP as used
    await supabase
      .from('otp_store')
      .update({ is_used: true })
      .eq('id', otpData.id);

    // Determine redirect based on user type
    const redirectMap = {
      administrator: '/admin-dashboard',
      agency: '/agency-dashboard',
      citizen: '/citizen-dashboard',
    };

    return {
      success: true,
      message: 'Login successful! Redirecting...',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
      },
      redirectTo: redirectMap[user.user_type as keyof typeof redirectMap],
    };
  } catch (error) {
    console.error('Login OTP verification error:', error);
    return {
      success: false,
      message: 'Login failed. Please try again.',
    };
  }
};

// Resend OTP
export const resendOTP = async (email: string, type: 'registration' | 'login'): Promise<OTPResponse> => {
  try {
    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Get existing pending data
    const { data: existingOTP } = await supabase
      .from('otp_store')
      .select('user_data')
      .eq('email', email.toLowerCase())
      .eq('otp_type', type)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Insert new OTP
    const { error } = await supabase
      .from('otp_store')
      .insert({
        email: email.toLowerCase(),
        otp,
        otp_type: type,
        user_data: existingOTP?.user_data || {},
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (error) throw error;

    // Send OTP via email
    try {
      const userName = (existingOTP?.user_data as any)?.name || '';
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: {
          to: email,
          otp,
          type,
          name: userName
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
      } else {
        console.log('Email sent:', emailData);
      }
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
    }

    console.log(`Resent OTP for ${email}: ${otp}`);

    return {
      success: true,
      message: 'New OTP sent to your email.',
      requiresOTP: true,
      email,
    };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      message: 'Failed to resend OTP. Please try again.',
    };
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('portal_users')
    .select('id, name, email, user_type, is_verified, created_at, last_login')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
