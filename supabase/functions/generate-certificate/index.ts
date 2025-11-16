import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const generateQRCode = (data: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

const generateCertificateHTML = (data: any): string => {
  const qrData = `${Deno.env.get('SUPABASE_URL')}/certificate/verify/${data.verification_code}`;
  const qrCodeUrl = generateQRCode(qrData);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Course Admission Eligibility Certificate</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Georgia', 'Times New Roman', serif; 
      color: #1a1a1a;
      line-height: 1.6;
    }
    .certificate {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      border: 12px solid #1e40af;
      border-radius: 8px;
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1e40af;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 15px;
      background: #1e40af;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
      font-weight: bold;
    }
    h1 {
      color: #1e40af;
      font-size: 32px;
      margin: 15px 0 10px;
      letter-spacing: 1px;
    }
    .subtitle {
      color: #64748b;
      font-size: 14px;
      font-style: italic;
    }
    .content {
      margin: 30px 0;
      padding: 20px;
    }
    .intro {
      font-size: 18px;
      text-align: center;
      margin-bottom: 30px;
      color: #475569;
    }
    .details {
      background: white;
      padding: 25px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      margin: 15px 0;
      padding: 10px;
      border-bottom: 1px dashed #cbd5e1;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #475569;
      width: 180px;
      flex-shrink: 0;
    }
    .value {
      color: #1e293b;
      font-weight: 500;
      flex: 1;
    }
    .cert-number {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
      margin: 25px 0;
      padding: 15px;
      background: #eff6ff;
      border-radius: 8px;
      border: 2px dashed #1e40af;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 3px solid #1e40af;
    }
    .signature {
      text-align: center;
    }
    .signature-line {
      width: 200px;
      border-top: 2px solid #1e293b;
      margin: 10px auto;
    }
    .signature-text {
      font-size: 14px;
      color: #475569;
      margin-top: 5px;
    }
    .qr-section {
      text-align: center;
    }
    .qr-code {
      width: 120px;
      height: 120px;
      margin: 10px auto;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
    }
    .qr-text {
      font-size: 11px;
      color: #64748b;
    }
    .seal {
      width: 100px;
      height: 100px;
      border: 4px solid #1e40af;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1e40af;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      line-height: 1.2;
      padding: 10px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">PM</div>
      <h1>Course Admission Eligibility Certificate</h1>
      <div class="subtitle">PM-AJAY Implementation Mapping Portal</div>
      <div class="subtitle">Issued by Zapserve Interconnecting Pvt Ltd</div>
    </div>

    <div class="content">
      <div class="intro">
        This is to certify that
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="label">Student Name:</span>
          <span class="value">${data.citizen_name}</span>
        </div>
        <div class="detail-row">
          <span class="label">Registration ID:</span>
          <span class="value">${data.registration_id}</span>
        </div>
        <div class="detail-row">
          <span class="label">Course:</span>
          <span class="value">${data.course_name}</span>
        </div>
        <div class="detail-row">
          <span class="label">Institution:</span>
          <span class="value">${data.college_name}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date of Approval:</span>
          <span class="value">${new Date(data.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div class="cert-number">
        Certificate No: ${data.certificate_number}
      </div>
    </div>

    <div class="footer">
      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-text">Authorized Signatory</div>
        <div class="signature-text">PM-AJAY Portal</div>
      </div>

      <div class="seal">
        OFFICIAL<br/>SEAL
      </div>

      <div class="qr-section">
        <img src="${qrCodeUrl}" class="qr-code" alt="QR Code" />
        <div class="qr-text">Scan to verify</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { certificate_id } = await req.json();

    if (!certificate_id) {
      return new Response(
        JSON.stringify({ error: 'certificate_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: cert, error: certError } = await supabase
      .from('certificates')
      .select(`
        *,
        portal_users!certificates_citizen_id_fkey(name, email)
      `)
      .eq('id', certificate_id)
      .single();

    if (certError || !cert) {
      return new Response(
        JSON.stringify({ error: 'Certificate not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const certificateData = {
      certificate_number: cert.certificate_number,
      verification_code: cert.verification_code,
      citizen_name: cert.portal_users?.name || 'Unknown',
      registration_id: cert.registration_id,
      course_name: cert.course_name,
      college_name: cert.college_name,
      issued_at: cert.issued_at,
    };

    const html = generateCertificateHTML(certificateData);

    return new Response(
      JSON.stringify({
        success: true,
        html,
        certificate: certificateData,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          `${supabaseUrl}/certificate/verify/${cert.verification_code}`
        )}`,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Certificate generation error:', error);
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