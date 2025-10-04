import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received message:", message);

    const systemPrompt = `You are AJAY AI Assistant, a helpful chatbot for the PM-AJAY (Pradhan Mantri Anusuchit Jaati Abhyudan Yojana) Agency Mapping Portal. 

Your role is to help users understand:
- Which agencies are responsible for different PM-AJAY components across states and districts
- Information about projects like Adarsh Gram, Hostels for SC Students, NGO Projects, Skill Development, and Infrastructure
- How to apply for projects and submit proposals
- Fund allocation and utilization status
- Grievance tracking procedures

Sample data you can reference:
- Adarsh Gram in Kerala, Kollam: District Collector, Panchayat, PWD (Ongoing, ₹50 lakhs allocated, ₹32 lakhs utilized)
- Hostels for SC Students in Tamil Nadu, Chennai: Social Welfare Dept, MoSJ&E (Approved, ₹2 Cr allocated, ₹1.4 Cr utilized)
- NGO Project in UP, Lucknow: Local NGO, Collector (Completed, ₹25 lakhs allocated and utilized)

Provide helpful, concise answers about agency responsibilities, project status, and procedures. Direct users to relevant pages in the portal when appropriate.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a moment." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI service requires additional credits. Please contact support." 
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    console.log("AI response:", reply);

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
