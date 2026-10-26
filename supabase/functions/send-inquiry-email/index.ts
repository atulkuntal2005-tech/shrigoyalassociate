// Supabase Edge Function: send-inquiry-email
// Securely dispatches inquiry email notifications via Resend to jgoyal156@gmail.com
// NEVER exposes RESEND_API_KEY to the frontend client.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InquiryPayload {
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyTitle?: string | null;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server email configuration missing.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: InquiryPayload = await req.json();
    const subjectLine = payload.propertyTitle
      ? `New Property Inquiry: ${payload.propertyTitle} – ${payload.name}`
      : `New Real Estate Inquiry from ${payload.name} – Shri Goyal Associate`;

    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e7e5e4; background-color: #faf9f6; color: #18181b;">
        <h2 style="margin-top: 0; color: #18181b; border-bottom: 1px solid #d6d3d1; padding-bottom: 12px;">
          Shri Goyal Associate — New Website Inquiry
        </h2>
        <p style="font-size: 15px; line-height: 1.6;">
          <strong>Client Name:</strong> ${payload.name}<br/>
          <strong>Phone:</strong> <a href="tel:${payload.phone}" style="color: #9a7b3e;">${payload.phone}</a><br/>
          <strong>Email:</strong> <a href="mailto:${payload.email}" style="color: #9a7b3e;">${payload.email}</a><br/>
          ${payload.propertyTitle ? `<strong>Property:</strong> ${payload.propertyTitle}<br/>` : ''}
        </p>
        <div style="background: #ffffff; padding: 16px; border: 1px solid #e7e5e4; margin-top: 16px;">
          <strong style="display: block; margin-bottom: 8px;">Message:</strong>
          <p style="margin: 0; white-space: pre-wrap; font-family: sans-serif; font-size: 14px; line-height: 1.6;">${payload.message}</p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #71717a; font-family: sans-serif;">
          Mandi Choraha, Near Shree Ram Sonk Road, Mathura, Uttar Pradesh – 281004
        </p>
      </div>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'Shri Goyal Associate <onboarding@resend.dev>',
        to: ['jgoyal156@gmail.com'],
        reply_to: payload.email,
        subject: subjectLine,
        html: htmlBody,
      }),
    });

    const result = await resendResponse.json();
    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Email delivery failed', details: result }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Unexpected error processing inquiry notification.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
