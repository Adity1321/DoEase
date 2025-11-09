import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../shared/cors.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'DoEase <notifications@example.com>';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const caller = req.headers.get('x-supabase-caller');
  if (caller !== 'postgres') {
    return new Response(JSON.stringify({ error: 'Unauthorized: This function can only be called by the database.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: tasksToNotify, error: rpcError } = await supabaseAdmin.rpc('get_tasks_to_notify');
    if (rpcError) throw rpcError;

    const emailPromises = [];
    const emailResults = [];

    for (const task of tasksToNotify) {
      if (task.email && task.username && RESEND_API_KEY) {
        const promise = fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: [task.email],
            subject: `⏰ Reminder: Task "${task.name}" is starting soon!`,
            html: `<p>Hi ${task.username},</p><p>Just a friendly reminder that your task, <strong>"${task.name}"</strong>, is scheduled to begin shortly.</p><p>You got this!</p>`,
          }),
        }).then(async res => {
            const data = await res.json();
            if (!res.ok) {
                console.error(`Failed to send email to ${task.email}. Status: ${res.status}`, data);
                emailResults.push({ success: false, email: task.email, error: data });
            } else {
                emailResults.push({ success: true, email: task.email, data: data });
            }
        }).catch(error => {
            console.error(`Network error sending email to ${task.email}:`, error);
            emailResults.push({ success: false, email: task.email, error: error.message });
        });
        emailPromises.push(promise);
      }
    }

    if (emailPromises.length > 0) {
      await Promise.all(emailPromises);
    }

    const successfulEmails = emailResults.filter(r => r.success).length;
    const failedEmails = emailResults.length - successfulEmails;

    console.log(`Task reminder check complete. Sent: ${successfulEmails}. Failed: ${failedEmails}.`);
    return new Response(JSON.stringify({ 
        message: `Task reminder check complete. Sent: ${successfulEmails}. Failed: ${failedEmails}.`,
        results: emailResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('General error in send-task-reminders function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
