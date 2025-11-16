import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  otp: string;
  type: 'registration' | 'login';
  name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, otp, type, name }: EmailRequest = await req.json();

    if (!to || !otp || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, otp, type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      console.log("Development mode: OTP for", to, "is:", otp);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP logged to console (development mode)",
          dev_otp: otp 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const subject = type === 'registration' 
      ? 'Verify Your PM AJAY Portal Registration'
      : 'PM AJAY Portal Login Verification';

    const greeting = name ? `Dear ${name}` : 'Hello';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">PM AJAY MAPPING</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Agency Mapping & Monitoring Portal</p>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            
            <p>${greeting},</p>
            
            <p>Your One-Time Password (OTP) for ${type === 'registration' ? 'completing your registration' : 'logging into your account'} is:</p>
            
            <div style="background: #f5f5f5; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            
            <p style="color: #666;"><strong>Important:</strong></p>
            <ul style="color: #666;">
              <li>This OTP is valid for 10 minutes</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">This is an automated message from the PM AJAY Mapping Portal. Please do not reply to this email.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2025 PM AJAY MAPPING | All Rights Reserved</p>
          </div>
        </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PM AJAY Portal <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await response.json();
    console.log("Email sent successfully:", data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        emailId: data.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to send email" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
