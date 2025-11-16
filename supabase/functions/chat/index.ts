import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function findRoute(supabase: any, query: string) {
  const queryLower = query.toLowerCase();
  
  const { data, error } = await supabase
    .from('route_index')
    .select('*')
    .or(`title.ilike.%${queryLower}%,description.ilike.%${queryLower}%`)
    .limit(3);

  if (error || !data || data.length === 0) {
    return null;
  }

  for (const route of data) {
    if (route.keywords) {
      for (const keyword of route.keywords) {
        if (queryLower.includes(keyword.toLowerCase())) {
          return route;
        }
      }
    }
  }

  return data[0];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const route = await findRoute(supabase, message);

    const navigationKeywords = [
      'how', 'where', 'submit', 'register', 'apply', 'file', 'view', 'check',
      'grievance', 'complaint', 'proposal', 'course', 'grant', 'eligibility'
    ];
    
    const isNavigationQuery = navigationKeywords.some(kw => 
      message.toLowerCase().includes(kw)
    );

    if (route && isNavigationQuery) {
      let reply = '';
      
      if (message.toLowerCase().includes('grievance') || message.toLowerCase().includes('complaint')) {
        reply = `To submit a grievance or complaint, please visit the **${route.title}** page.\n\n`;
        reply += `This page allows you to file complaints and track their status. You'll need to provide details about your issue and any supporting information.`;
      } else if (message.toLowerCase().includes('course') || message.toLowerCase().includes('register')) {
        reply = `You can register for courses on the **${route.title}** page.\n\n`;
        reply += `Select your desired course, choose a college, and provide your reason for enrollment. Admin will review and approve your registration.`;
      } else if (message.toLowerCase().includes('proposal')) {
        reply = `To submit or view proposals, go to the **${route.title}** page.\n\n`;
        reply += `You can submit project proposals with detailed descriptions, and track their approval status from the admin team.`;
      } else if (message.toLowerCase().includes('grant') || message.toLowerCase().includes('eligibility')) {
        reply = `Check out the **${route.title}** page for grant-related services.\n\n`;
        reply += `You can apply for grants, check your eligibility, and track the status of your applications.`;
      } else {
        reply = `I found the **${route.title}** page that might help you.\n\n${route.description}`;
      }

      return new Response(
        JSON.stringify({
          reply,
          link: route.path,
          linkText: `Go to ${route.title}`
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({
          reply: 'I can help you navigate the PM-AJAY portal. Try asking about submitting grievances, registering for courses, or applying for grants.'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const systemPrompt = `You are AJAY AI Assistant for the PM-AJAY portal. Help users with:
- Grievance submission and tracking
- Course registration
- Grant applications and eligibility
- Proposal submissions
- Scheme information

Provide helpful, concise answers. When users ask about navigation, guide them to the appropriate portal section.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 402) {
        return new Response(
          JSON.stringify({ 
            reply: 'I can help you navigate the portal. Try asking: "How do I submit a grievance?" or "Where can I register for courses?"'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        reply: 'I\'m here to help you navigate the PM-AJAY portal. You can ask about grievances, courses, grants, or proposals.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});