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

    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, current_streak, last_streak_updated, email_notifications_enabled')
      .gt('current_streak', 0)
      .eq('email_notifications_enabled', true);

    if (profileError) throw profileError;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const emailResults = [];
    const brokenStreakPromises = profiles.map(async (profile) => {
      if (!profile.last_streak_updated) return;
      
      const lastUpdated = new Date(profile.last_streak_updated);
      lastUpdated.setUTCHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastUpdated.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        await supabaseAdmin
          .from('profiles')
          .update({ current_streak: 0 })
          .eq('id', profile.id);

        if (RESEND_API_KEY && profile.email) {
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: [profile.email],
                subject: 'Your Productivity Streak on DoEase has been Reset',
                html: `
                  <p>Hi ${profile.username},</p>
                  <p>It looks like you missed a day, and your productivity streak of ${profile.current_streak} days has been reset. Don't worry, you can start a new one today!</p>
                  <p>Complete any task to begin a new streak.</p>
                  <p>Best,</p>
                  <p>The DoEase Team</p>
                `,
              }),
            });
            const data = await res.json();
            if (!res.ok) {
              console.error(`Failed to send streak break email to ${profile.email}. Status: ${res.status}`, data);
              emailResults.push({ success: false, email: profile.email, error: data });
            } else {
              emailResults.push({ success: true, email: profile.email, data: data });
            }
          } catch (error) {
            console.error(`Network error sending streak break email to ${profile.email}:`, error);
            emailResults.push({ success: false, email: profile.email, error: error.message });
          }
        }
      }
    });

    await Promise.all(brokenStreakPromises);
    
    const successfulEmails = emailResults.filter(r => r.success).length;
    const failedEmails = emailResults.length - successfulEmails;

    console.log(`Streak check complete. Notifications sent: ${successfulEmails}. Failed: ${failedEmails}.`);
    return new Response(JSON.stringify({ 
        message: `Streak check completed. Notifications sent: ${successfulEmails}. Failed: ${failedEmails}.`,
        results: emailResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('General error in check-streaks function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
