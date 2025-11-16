const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { to, otp, type, name, subject, html, text } = body;

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: to' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let emailSubject = subject || 'OTP Verification';
    let emailBody = html || text || '';

    if (otp) {
      const typeText = type === 'registration' ? 'Registration' : type === 'login' ? 'Login' : 'Verification';
      emailSubject = `Your ${typeText} OTP - PM-AJAY Portal`;
      
      emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">PM-AJAY Portal</h1>
              </div>
              <div style="padding: 30px; background: #f9fafb;">
                <p>Hello ${name || 'User'},</p>
                <p>Your One-Time Password (OTP) for ${typeText.toLowerCase()} is:</p>
                <div style="background: white; border: 2px solid #1e40af; padding: 20px; text-align: center; margin: 20px 0;">
                  <h1 style="color: #1e40af; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this OTP, please ignore this email.</p>
              </div>
              <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                <p>This is an official communication from PM-AJAY Implementation Mapping Portal</p>
                <p>© ${new Date().getFullYear()} Zapserve Interconnecting Pvt Ltd</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    console.log(`\n=== OTP EMAIL ===`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${emailSubject}`);
    if (otp) {
      console.log(`OTP: ${otp}`);
      console.log(`Type: ${type}`);
    }
    console.log(`================\n`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully (development mode - check console for OTP)',
        to,
        otp: otp || undefined,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});