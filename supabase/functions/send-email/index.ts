import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts';

interface EmailRequest {
  to: string;
  templateId: string;
  data: Record<string, any>;
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    // Verify request method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get request data
    const { to, templateId, data }: EmailRequest = await req.json();

    // Validate inputs
    if (!to || !templateId || !data) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Initialize SMTP client
    const client = new SmtpClient();

    // Connect to SMTP server
    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOST') || '',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USER') || '',
      password: Deno.env.get('SMTP_PASS') || '',
    });

    // Get template from database
    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error || !template) {
      throw new Error('Template not found');
    }

    // Replace variables in template
    let subject = template.subject;
    let content = template.content;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      content = content.replace(regex, String(value));
    });

    // Send email
    await client.send({
      from: Deno.env.get('SMTP_FROM') || '',
      to,
      subject,
      content,
      html: content,
    });

    // Close connection
    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});