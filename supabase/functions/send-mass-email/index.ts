import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function sendEmail(to: string, subject: string, html: string) {
  console.log(`Sending email to: ${to}, Subject: ${subject}`);
  return { success: true, delivered_at: new Date().toISOString() };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { broadcast_id } = await req.json();

    if (!broadcast_id) {
      return new Response(
        JSON.stringify({ error: 'broadcast_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: broadcast, error: broadcastError } = await supabase
      .from('email_broadcasts')
      .select('*')
      .eq('id', broadcast_id)
      .single();

    if (broadcastError || !broadcast) {
      return new Response(
        JSON.stringify({ error: 'Broadcast not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('email_broadcasts')
      .update({ status: 'sending' })
      .eq('id', broadcast_id);

    let query = supabase.from('portal_users').select('id, email, name');

    if (broadcast.recipient_filter && broadcast.recipient_filter !== 'all') {
      query = query.eq('user_type', broadcast.recipient_filter);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) throw usersError;

    let sent = 0;
    let failed = 0;

    for (const user of users || []) {
      if (!user.email) {
        failed++;
        continue;
      }

      try {
        const emailHtml = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0;">PM-AJAY Portal</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <h2 style="color: #1e40af;">${broadcast.title}</h2>
                  <div style="margin: 20px 0;">
                    ${broadcast.body.replace(/\n/g, '<br>')}
                  </div>
                  ${broadcast.attachment_url ? `
                    <div style="margin: 20px 0;">
                      <a href="${broadcast.attachment_url}" style="display: inline-block; padding: 10px 20px; background: #1e40af; color: white; text-decoration: none; border-radius: 5px;">View Attachment</a>
                    </div>
                  ` : ''}
                </div>
                <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                  <p>This is an official communication from PM-AJAY Implementation Mapping Portal</p>
                  <p>© ${new Date().getFullYear()} Zapserve Interconnecting Pvt Ltd</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const result = await sendEmail(user.email, broadcast.title, emailHtml);

        await supabase.from('email_logs').insert({
          email_broadcast_id: broadcast_id,
          user_id: user.id,
          email: user.email,
          delivered_at: result.delivered_at,
          status: 'sent',
        });

        sent++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        
        await supabase.from('email_logs').insert({
          email_broadcast_id: broadcast_id,
          user_id: user.id,
          email: user.email,
          status: 'failed',
          error_message: error.message,
        });

        failed++;
      }
    }

    await supabase
      .from('email_broadcasts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_recipients: users?.length || 0,
        total_sent: sent,
        total_failed: failed,
      })
      .eq('id', broadcast_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Broadcast sent',
        stats: {
          total: users?.length || 0,
          sent,
          failed,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Broadcast error:', error);
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