import { createClient } from '@supabase/supabase-js';

const FEEDBACK_RECIPIENT_EMAIL = 'kuehnewilly@gmail.com';
const DEFAULT_SUPABASE_URL = 'https://grrhlhhinmjglnvmmbzb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycmhsaGhpbm1qZ2xudm1tYnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDM3ODYsImV4cCI6MjEwMzA3OTc4Nn0.rqONT4AeXhmFNL-r9nrMc7V35cSDloCiELILkk1roYY';

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type, subject, title, description, contactEmail, diagnostics, crashReport, crashLogs, timestamp } = body;

    const reportTypeLabel = type === 'feature' ? 'Feature Request' : 'Bug / Crash Report';
    const emailSubject = subject || `[FMS v2.2 ${reportTypeLabel}] ${title || 'Untitled Report'}`;
    const submittedAt = timestamp || new Date().toISOString();

    const crashSummary = crashReport
      ? `${crashReport.context || 'Crash'}: ${crashReport.message || 'Unknown error'}${
          crashReport.clubName ? ` (${crashReport.clubName}, Tier ${crashReport.tier}, Year ${crashReport.year}, Phase: ${crashReport.seasonPhase})` : ''
        }${crashReport.stack ? `\n\nStack:\n${crashReport.stack}` : ''}`
      : 'None';

    console.log(`[Feedback Report Routed to ${FEEDBACK_RECIPIENT_EMAIL}]:`, {
      to: FEEDBACK_RECIPIENT_EMAIL,
      type: reportTypeLabel,
      subject: emailSubject,
      title: title || 'Untitled Report',
      contactEmail: contactEmail || 'anonymous',
      crashCount: Array.isArray(crashLogs) ? crashLogs.length : (crashReport ? 1 : 0),
      timestamp: submittedAt
    });

    // 1. Store in Supabase `feedback_reports` table
    let supabaseSaved = false;
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from('feedback_reports').insert({
        report_type: type === 'feature' ? 'feature' : 'bug',
        subject: emailSubject,
        title: title || 'Untitled Report',
        description: description || '(No additional details provided)',
        contact_email: contactEmail || 'anonymous',
        diagnostics: diagnostics || '(No diagnostics attached)',
        crash_summary: crashSummary,
        crash_report: crashReport || null,
        recipient_email: FEEDBACK_RECIPIENT_EMAIL,
        created_at: submittedAt
      });
      supabaseSaved = !error;
      if (error) {
        console.warn('Supabase feedback_reports insert warning:', error.message);
      }
    } catch (sbErr) {
      console.warn('Supabase feedback_reports exception:', sbErr);
    }

    // 2. Attempt email delivery (Resend if RESEND_API_KEY is present, plus FormSubmit fallback)
    let emailDelivered = false;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Football Manager Sim <onboarding@resend.dev>',
            to: [FEEDBACK_RECIPIENT_EMAIL],
            reply_to: contactEmail && String(contactEmail).includes('@') ? String(contactEmail).trim() : undefined,
            subject: emailSubject,
            text: [
              `Report Type: ${reportTypeLabel}`,
              `Title: ${title || 'Untitled Report'}`,
              `User Email: ${contactEmail || 'anonymous'}`,
              `Timestamp: ${submittedAt}`,
              '',
              '--- DESCRIPTION ---',
              description || '(No additional details provided)',
              '',
              '--- DIAGNOSTICS ---',
              diagnostics || '(No diagnostics attached)',
              '',
              '--- CRASH DETAILS ---',
              crashSummary
            ].join('\n')
          })
        });
        emailDelivered = resendRes.ok;
      } catch (resendErr) {
        console.warn('Resend email warning:', resendErr);
      }
    }

    if (!emailDelivered) {
      try {
        const headers = event.headers || {};
        const originHeader = headers.origin || headers.Origin || 'https://footballmanagersim.com';
        const refererHeader = headers.referer || headers.Referer || `${originHeader}/`;

        const formSubmitPayload: Record<string, string> = {
          _subject: emailSubject,
          _template: 'table',
          _captcha: 'false',
          Report_Type: reportTypeLabel,
          Summary: title || 'Untitled Report',
          User_Email: contactEmail || 'anonymous',
          Description: description || '(No additional details provided)',
          Diagnostics: diagnostics || '(No diagnostics attached)',
          Crash_Details: crashSummary,
          Timestamp: submittedAt
        };
        if (contactEmail && String(contactEmail).includes('@')) {
          formSubmitPayload._replyto = String(contactEmail).trim();
        }

        const relayRes = await fetch(`https://formsubmit.co/ajax/${FEEDBACK_RECIPIENT_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': originHeader,
            'Referer': refererHeader,
            'User-Agent': headers['user-agent'] || 'Mozilla/5.0 (compatible; FootballManagerSim/2.2)'
          },
          body: JSON.stringify(formSubmitPayload)
        });

        emailDelivered = relayRes.ok;
      } catch (relayErr) {
        console.warn('FormSubmit relay warning:', relayErr);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ ok: true, supabaseSaved, delivered: emailDelivered })
    };
  } catch (err: any) {
    console.error('Error recording feedback:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to record feedback' })
    };
  }
};
