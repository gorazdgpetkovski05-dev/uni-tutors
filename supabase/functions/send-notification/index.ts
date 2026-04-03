/**
 * Supabase Edge Function: send-notification
 *
 * Deployment reference for email notifications via Supabase's built-in
 * Resend / SMTP integration. This file is NOT bundled by Vite -- it is
 * deployed independently with `supabase functions deploy send-notification`.
 *
 * Environment variables (set in Supabase dashboard):
 *   RESEND_API_KEY   - API key from resend.com (if using Resend integration)
 *   SENDER_EMAIL     - Verified sender address, e.g. noreply@unitutors.mk
 *   SITE_URL         - Public site URL, e.g. https://unitutors.mk
 *
 * Invoke from client:
 *   const { data, error } = await supabase.functions.invoke('send-notification', {
 *     body: { to: 'student@example.com', template: 'booking_approved', data: { ... }, language: 'mk' }
 *   });
 *
 * Or trigger via a Supabase Database Webhook on the `notifications` table INSERT.
 */

// Deno imports (Edge Functions run on Deno)
// @ts-ignore -- Deno runtime import, not resolved by local TS
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ---------------------------------------------------------------------------
// CORS headers for browser invocations
// ---------------------------------------------------------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---------------------------------------------------------------------------
// Inline template rendering (mirrors services/emailTemplates.ts)
//
// Edge Functions cannot import from the Vite project, so we duplicate the
// template logic here. For a production setup you could publish the templates
// as a shared Deno module or NPM package.
// ---------------------------------------------------------------------------

const BRAND = {
  name: 'UniTutors MK',
  color: '#4f46e5',
  colorLight: '#eef2ff',
  white: '#ffffff',
  gray: '#6b7280',
  grayLight: '#f9fafb',
  grayBorder: '#e5e7eb',
  textDark: '#111827',
  textMuted: '#4b5563',
  supportEmail: 'support@unitutors.mk',
  whatsapp: '+38970356541',
} as const;

function getSiteUrl(): string {
  // @ts-ignore -- Deno env
  return Deno.env.get('SITE_URL') || 'https://unitutors.mk';
}

function wrapLayout(body: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${BRAND.name}</title></head>
<body style="margin:0;padding:0;background-color:${BRAND.grayLight};font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.grayLight};">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.white};border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr><td style="background-color:${BRAND.color};padding:24px 32px;text-align:center;">
<h1 style="margin:0;font-size:24px;font-weight:700;color:${BRAND.white};">${BRAND.name}</h1>
</td></tr>
<tr><td style="padding:32px;">${body}</td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid ${BRAND.grayBorder};text-align:center;">
<p style="margin:0;font-size:12px;color:${BRAND.gray};">
<a href="${getSiteUrl()}" style="color:${BRAND.color};text-decoration:none;">${getSiteUrl()}</a>
&bull; <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};text-decoration:none;">${BRAND.supportEmail}</a>
</p></td></tr>
</table></td></tr></table></body></html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
<tr><td style="background-color:${BRAND.color};border-radius:6px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:${BRAND.white};text-decoration:none;">${text}</a>
</td></tr></table>`;
}

type Lang = 'en' | 'mk';

interface TemplateResult {
  subject: string;
  html: string;
}

function renderTemplate(
  template: string,
  data: Record<string, string>,
  lang: Lang,
): TemplateResult {
  const isEn = lang === 'en';
  const siteUrl = getSiteUrl();
  const name = data.studentName || '';
  const course = data.courseName || '';

  switch (template) {
    case 'booking_approved': {
      const subject = isEn
        ? `Your booking for "${course}" has been approved!`
        : `Вашата резервација за "${course}" е одобрена!`;
      const body = `
        <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">${isEn ? 'Congratulations!' : 'Честитки!'}</h2>
        <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
          ${isEn
            ? `Hi ${name}, your booking for <strong>${course}</strong> has been approved.`
            : `Здраво ${name}, вашата резервација за <strong>${course}</strong> е одобрена.`}
        </p>
        ${data.discordLink ? `<div style="background-color:${BRAND.colorLight};border-radius:6px;padding:16px;margin:16px 0;">
          <p style="margin:0;font-size:14px;color:${BRAND.textDark};"><strong>${isEn ? 'Study Hub:' : 'Линк:'}</strong>
          <a href="${data.discordLink}" style="color:${BRAND.color};text-decoration:none;">${data.discordLink}</a></p></div>` : ''}
        ${ctaButton(isEn ? 'Go to Dashboard' : 'Контролна Табла', `${siteUrl}/dashboard`)}`;
      return { subject, html: wrapLayout(body, subject) };
    }

    case 'booking_rejected': {
      const subject = isEn
        ? `Update on your booking for "${course}"`
        : `Ажурирање за резервацијата за "${course}"`;
      const body = `
        <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">${isEn ? 'Booking Update' : 'Ажурирање'}</h2>
        <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
          ${isEn
            ? `Hi ${name}, unfortunately your booking for <strong>${course}</strong> could not be approved at this time.`
            : `Здраво ${name}, за жал резервацијата за <strong>${course}</strong> не може да биде одобрена.`}
        </p>
        ${data.reason ? `<div style="background-color:${BRAND.grayLight};border-left:4px solid ${BRAND.color};padding:12px 16px;margin:16px 0;">
          <p style="margin:0;font-size:14px;color:${BRAND.textMuted};"><strong>${isEn ? 'Reason:' : 'Причина:'}</strong> ${data.reason}</p></div>` : ''}
        <p style="margin:12px 0;font-size:14px;color:${BRAND.textMuted};text-align:center;">
          <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};">${BRAND.supportEmail}</a></p>
        ${ctaButton(isEn ? 'Browse Courses' : 'Разгледај Курсеви', `${siteUrl}/courses`)}`;
      return { subject, html: wrapLayout(body, subject) };
    }

    case 'session_scheduled': {
      const subject = isEn
        ? `New session scheduled: ${course}`
        : `Нова сесија закажана: ${course}`;
      const body = `
        <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">${isEn ? 'New Session' : 'Нова Сесија'}</h2>
        <p style="margin:0 0 16px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
          ${isEn ? `Hi ${name}, a new session has been scheduled.` : `Здраво ${name}, нова сесија е закажана.`}
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid ${BRAND.grayBorder};border-radius:6px;">
          <tr><td style="padding:8px 12px;font-size:14px;color:${BRAND.gray};border-bottom:1px solid ${BRAND.grayBorder};">${isEn ? 'Course' : 'Курс'}</td>
              <td style="padding:8px 12px;font-size:14px;color:${BRAND.textDark};font-weight:600;border-bottom:1px solid ${BRAND.grayBorder};">${course}</td></tr>
          <tr><td style="padding:8px 12px;font-size:14px;color:${BRAND.gray};border-bottom:1px solid ${BRAND.grayBorder};">${isEn ? 'Session' : 'Сесија'}</td>
              <td style="padding:8px 12px;font-size:14px;color:${BRAND.textDark};font-weight:600;border-bottom:1px solid ${BRAND.grayBorder};">${data.sessionTitle || ''}</td></tr>
          <tr><td style="padding:8px 12px;font-size:14px;color:${BRAND.gray};border-bottom:1px solid ${BRAND.grayBorder};">${isEn ? 'Date' : 'Датум'}</td>
              <td style="padding:8px 12px;font-size:14px;color:${BRAND.textDark};font-weight:600;border-bottom:1px solid ${BRAND.grayBorder};">${data.sessionDate || ''}</td></tr>
          <tr><td style="padding:8px 12px;font-size:14px;color:${BRAND.gray};">${isEn ? 'Time' : 'Време'}</td>
              <td style="padding:8px 12px;font-size:14px;color:${BRAND.textDark};font-weight:600;">${data.sessionTime || ''}</td></tr>
        </table>
        ${ctaButton(isEn ? 'View Dashboard' : 'Контролна Табла', `${siteUrl}/dashboard`)}`;
      return { subject, html: wrapLayout(body, subject) };
    }

    case 'review_request': {
      const subject = isEn
        ? `How was "${course}"? Share your feedback`
        : `Како беше "${course}"? Споделете мислење`;
      const body = `
        <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">${isEn ? 'Share Your Feedback' : 'Споделете Мислење'}</h2>
        <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
          ${isEn
            ? `Hi ${name}, congratulations on completing <strong>${course}</strong> with ${data.professorName || 'your instructor'}!`
            : `Здраво ${name}, честитки за завршување на <strong>${course}</strong> со ${data.professorName || 'вашиот инструктор'}!`}
        </p>
        <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
          ${isEn
            ? 'Your review helps other students and our professionals improve.'
            : 'Вашата рецензија им помага на другите студенти и на нашите професионалци.'}
        </p>
        ${ctaButton(isEn ? 'Leave a Review' : 'Остави Рецензија', data.reviewUrl || `${siteUrl}/dashboard`)}`;
      return { subject, html: wrapLayout(body, subject) };
    }

    case 'welcome': {
      const subject = isEn
        ? `Welcome to ${BRAND.name}!`
        : `Добредојдовте на ${BRAND.name}!`;
      const body = `
        <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">${isEn ? `Welcome, ${name}!` : `Добредојдовте, ${name}!`}</h2>
        <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
          ${isEn
            ? `Thank you for joining ${BRAND.name}. We're excited to help you master your university courses.`
            : `Ви благодариме што се приклучивте на ${BRAND.name}. Со нетрпение очекуваме да ви помогнеме.`}
        </p>
        ${ctaButton(isEn ? 'Explore Courses' : 'Разгледај Курсеви', `${siteUrl}/courses`)}
        <p style="margin:16px 0 0;font-size:14px;color:${BRAND.textMuted};text-align:center;">
          <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};text-decoration:none;">${BRAND.supportEmail}</a>
          &bull; <a href="https://wa.me/${BRAND.whatsapp.replace(/\+/g, '')}" style="color:${BRAND.color};text-decoration:none;">WhatsApp</a>
        </p>`;
      return { subject, html: wrapLayout(body, subject) };
    }

    default:
      throw new Error(`Unknown template: ${template}`);
  }
}

// ---------------------------------------------------------------------------
// Edge Function handler
// ---------------------------------------------------------------------------
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, template, data, language } = await req.json() as {
      to: string;
      template: string;
      data: Record<string, string>;
      language?: Lang;
    };

    // Validate required fields
    if (!to || !template || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, template, data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const lang: Lang = language === 'mk' ? 'mk' : 'en';
    const { subject, html } = renderTemplate(template, data, lang);

    // --- Send via Resend (Supabase's recommended email provider) ---
    // @ts-ignore -- Deno env
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    // @ts-ignore -- Deno env
    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'noreply@unitutors.mk';

    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `${BRAND.name} <${senderEmail}>`,
          to: [to],
          subject,
          html,
        }),
      });

      const resendData = await resendRes.json();

      if (!resendRes.ok) {
        console.error('Resend error:', resendData);
        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: resendData }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ success: true, emailId: resendData.id, subject }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // If no Resend key, return the rendered email for preview / debugging
    return new Response(
      JSON.stringify({
        success: true,
        preview: true,
        message: 'No RESEND_API_KEY configured. Returning rendered email for preview.',
        subject,
        html,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('send-notification error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
