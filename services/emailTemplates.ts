
type Language = 'en' | 'mk';

interface EmailOutput {
  subject: string;
  html: string;
}

// ---------------------------------------------------------------------------
// Brand constants
// ---------------------------------------------------------------------------
const BRAND = {
  name: 'UniTutors MK',
  color: '#4f46e5',       // indigo-600
  colorLight: '#eef2ff',  // indigo-50
  colorDark: '#3730a3',   // indigo-800
  white: '#ffffff',
  gray: '#6b7280',        // gray-500
  grayLight: '#f9fafb',   // gray-50
  grayBorder: '#e5e7eb',  // gray-200
  textDark: '#111827',     // gray-900
  textMuted: '#4b5563',   // gray-600
  siteUrl: 'https://unitutors.mk',
  supportEmail: 'support@unitutors.mk',
  whatsapp: '+38970356541',
} as const;

// ---------------------------------------------------------------------------
// Shared layout wrapper
// ---------------------------------------------------------------------------
function wrapLayout(bodyContent: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND.name}</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,sans-serif !important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.grayLight};font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.grayLight};">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.white};border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.color};padding:24px 32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:${BRAND.white};letter-spacing:-0.5px;">${BRAND.name}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid ${BRAND.grayBorder};text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:${BRAND.gray};">
                ${BRAND.name} &mdash; Master your university courses
              </p>
              <p style="margin:0;font-size:12px;color:${BRAND.gray};">
                <a href="${BRAND.siteUrl}" style="color:${BRAND.color};text-decoration:none;">${BRAND.siteUrl}</a>
                &nbsp;&bull;&nbsp;
                <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};text-decoration:none;">${BRAND.supportEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Reusable elements
// ---------------------------------------------------------------------------
function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td style="background-color:${BRAND.color};border-radius:6px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:${BRAND.white};text-decoration:none;border-radius:6px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:8px 12px;font-size:14px;color:${BRAND.gray};border-bottom:1px solid ${BRAND.grayBorder};width:140px;">${label}</td>
  <td style="padding:8px 12px;font-size:14px;color:${BRAND.textDark};border-bottom:1px solid ${BRAND.grayBorder};font-weight:600;">${value}</td>
</tr>`;
}

function infoTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid ${BRAND.grayBorder};border-radius:6px;overflow:hidden;">
  ${rows}
</table>`;
}

// ---------------------------------------------------------------------------
// 1. Booking Approved
// ---------------------------------------------------------------------------
interface BookingApprovedData {
  studentName: string;
  courseName: string;
  discordLink?: string;
  dashboardUrl?: string;
}

function bookingApproved(data: BookingApprovedData, lang: Language): EmailOutput {
  const isEn = lang === 'en';
  const dashboardUrl = data.dashboardUrl || `${BRAND.siteUrl}/dashboard`;

  const subject = isEn
    ? `Your booking for "${data.courseName}" has been approved!`
    : `Вашата резервација за "${data.courseName}" е одобрена!`;

  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">
      ${isEn ? 'Congratulations!' : 'Честитки!'}
    </h2>
    <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? `Hi ${data.studentName}, great news! Your booking for <strong>${data.courseName}</strong> has been approved.`
        : `Здраво ${data.studentName}, одлични вести! Вашата резервација за <strong>${data.courseName}</strong> е одобрена.`}
    </p>
    <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? 'You can now access your course details and upcoming sessions from your dashboard.'
        : 'Сега можете да пристапите до деталите за курсот и претстојните сесии преку вашата контролна табла.'}
    </p>
    ${data.discordLink ? `
    <div style="background-color:${BRAND.colorLight};border-radius:6px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:${BRAND.textDark};">
        <strong>${isEn ? 'Study Hub Link:' : 'Линк за студирање:'}</strong><br/>
        <a href="${data.discordLink}" style="color:${BRAND.color};text-decoration:none;word-break:break-all;">${data.discordLink}</a>
      </p>
    </div>` : ''}
    ${ctaButton(isEn ? 'Go to Dashboard' : 'Отвори Контролна Табла', dashboardUrl)}
    <p style="margin:16px 0 0;font-size:13px;color:${BRAND.gray};text-align:center;">
      ${isEn
        ? 'If you have any questions, feel free to reach out to our support team.'
        : 'Доколку имате прашања, слободно контактирајте го нашиот тим за поддршка.'}
    </p>`;

  return { subject, html: wrapLayout(body, subject) };
}

// ---------------------------------------------------------------------------
// 2. Booking Rejected
// ---------------------------------------------------------------------------
interface BookingRejectedData {
  studentName: string;
  courseName: string;
  reason?: string;
}

function bookingRejected(data: BookingRejectedData, lang: Language): EmailOutput {
  const isEn = lang === 'en';

  const subject = isEn
    ? `Update on your booking for "${data.courseName}"`
    : `Ажурирање за вашата резервација за "${data.courseName}"`;

  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">
      ${isEn ? 'Booking Update' : 'Ажурирање на Резервацијата'}
    </h2>
    <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? `Hi ${data.studentName}, unfortunately your booking for <strong>${data.courseName}</strong> could not be approved at this time.`
        : `Здраво ${data.studentName}, за жал вашата резервација за <strong>${data.courseName}</strong> не може да биде одобрена во моментов.`}
    </p>
    ${data.reason ? `
    <div style="background-color:${BRAND.grayLight};border-left:4px solid ${BRAND.color};padding:12px 16px;margin:16px 0;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:14px;color:${BRAND.textMuted};">
        <strong>${isEn ? 'Reason:' : 'Причина:'}</strong> ${data.reason}
      </p>
    </div>` : ''}
    <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? 'This could be due to scheduling conflicts or capacity limits. Please don\'t hesitate to try again or contact us for more information.'
        : 'Ова може да се должи на конфликти во распоредот или ограничувања на капацитетот. Ве молиме обидете се повторно или контактирајте не за повеќе информации.'}
    </p>
    <div style="background-color:${BRAND.colorLight};border-radius:6px;padding:16px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:14px;color:${BRAND.textDark};font-weight:600;">
        ${isEn ? 'Need help? Contact us:' : 'Ви треба помош? Контактирајте не:'}
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.textMuted};">
        <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};text-decoration:none;">${BRAND.supportEmail}</a>
        &nbsp;&bull;&nbsp;
        <a href="https://wa.me/${BRAND.whatsapp.replace(/\+/g, '')}" style="color:${BRAND.color};text-decoration:none;">WhatsApp</a>
      </p>
    </div>
    ${ctaButton(isEn ? 'Browse Other Courses' : 'Разгледај Други Курсеви', `${BRAND.siteUrl}/courses`)}`;

  return { subject, html: wrapLayout(body, subject) };
}

// ---------------------------------------------------------------------------
// 3. New Session Scheduled
// ---------------------------------------------------------------------------
interface SessionScheduledData {
  studentName: string;
  courseName: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  dashboardUrl?: string;
}

function sessionScheduled(data: SessionScheduledData, lang: Language): EmailOutput {
  const isEn = lang === 'en';
  const dashboardUrl = data.dashboardUrl || `${BRAND.siteUrl}/dashboard`;

  const subject = isEn
    ? `New session scheduled: ${data.courseName}`
    : `Нова сесија закажана: ${data.courseName}`;

  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">
      ${isEn ? 'New Session Scheduled' : 'Нова Сесија Закажана'}
    </h2>
    <p style="margin:0 0 16px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? `Hi ${data.studentName}, a new session has been scheduled for your course.`
        : `Здраво ${data.studentName}, нова сесија е закажана за вашиот курс.`}
    </p>
    ${infoTable(
      infoRow(isEn ? 'Course' : 'Курс', data.courseName) +
      infoRow(isEn ? 'Session' : 'Сесија', data.sessionTitle) +
      infoRow(isEn ? 'Date' : 'Датум', data.sessionDate) +
      infoRow(isEn ? 'Time' : 'Време', data.sessionTime)
    )}
    <p style="margin:16px 0 0;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? 'Make sure to prepare any questions you have in advance. See you there!'
        : 'Подгответе ги прашањата што ги имате однапред. Се гледаме!'}
    </p>
    ${ctaButton(isEn ? 'View in Dashboard' : 'Погледни во Контролна Табла', dashboardUrl)}`;

  return { subject, html: wrapLayout(body, subject) };
}

// ---------------------------------------------------------------------------
// 4. Review Request
// ---------------------------------------------------------------------------
interface ReviewRequestData {
  studentName: string;
  courseName: string;
  professorName: string;
  reviewUrl?: string;
}

function reviewRequest(data: ReviewRequestData, lang: Language): EmailOutput {
  const isEn = lang === 'en';
  const reviewUrl = data.reviewUrl || `${BRAND.siteUrl}/dashboard`;

  const subject = isEn
    ? `How was "${data.courseName}"? Share your feedback`
    : `Како беше "${data.courseName}"? Споделете го вашето мислење`;

  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">
      ${isEn ? 'We\'d Love Your Feedback' : 'Би Сакале Ваше Мислење'}
    </h2>
    <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? `Hi ${data.studentName}, congratulations on completing <strong>${data.courseName}</strong> with ${data.professorName}!`
        : `Здраво ${data.studentName}, честитки за завршување на <strong>${data.courseName}</strong> со ${data.professorName}!`}
    </p>
    <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? 'Your review helps other students make informed decisions and helps our professionals improve their sessions.'
        : 'Вашата рецензија им помага на другите студенти да донесат информирани одлуки и им помага на нашите професионалци да ги подобрат сесиите.'}
    </p>
    <div style="text-align:center;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:28px;">&#11088; &#11088; &#11088; &#11088; &#11088;</p>
      <p style="margin:0;font-size:13px;color:${BRAND.gray};">
        ${isEn ? 'Rate your experience' : 'Оценете го вашето искуство'}
      </p>
    </div>
    ${ctaButton(isEn ? 'Leave a Review' : 'Остави Рецензија', reviewUrl)}
    <p style="margin:16px 0 0;font-size:13px;color:${BRAND.gray};text-align:center;">
      ${isEn
        ? 'It only takes a minute. Thank you for helping our community!'
        : 'Потребна е само една минута. Ви благодариме што помагате на нашата заедница!'}
    </p>`;

  return { subject, html: wrapLayout(body, subject) };
}

// ---------------------------------------------------------------------------
// 5. Welcome Email
// ---------------------------------------------------------------------------
interface WelcomeData {
  studentName: string;
  dashboardUrl?: string;
}

function welcome(data: WelcomeData, lang: Language): EmailOutput {
  const isEn = lang === 'en';
  const dashboardUrl = data.dashboardUrl || `${BRAND.siteUrl}/dashboard`;

  const subject = isEn
    ? `Welcome to ${BRAND.name}!`
    : `Добредојдовте на ${BRAND.name}!`;

  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND.textDark};">
      ${isEn ? `Welcome, ${data.studentName}!` : `Добредојдовте, ${data.studentName}!`}
    </h2>
    <p style="margin:0 0 12px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      ${isEn
        ? `Thank you for joining ${BRAND.name}. We're excited to help you master your university courses with the guidance of certified professionals.`
        : `Ви благодариме што се приклучивте на ${BRAND.name}. Со нетрпение очекуваме да ви помогнеме да ги совладате вашите универзитетски курсеви со водство од сертифицирани професионалци.`}
    </p>
    <h3 style="margin:20px 0 12px;font-size:16px;color:${BRAND.textDark};">
      ${isEn ? 'Here\'s how to get started:' : 'Еве како да започнете:'}
    </h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:32px;height:32px;background-color:${BRAND.colorLight};border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;font-weight:700;color:${BRAND.color};">1</td>
              <td style="padding-left:12px;font-size:14px;color:${BRAND.textMuted};line-height:1.5;">
                <strong>${isEn ? 'Browse courses' : 'Разгледајте курсеви'}</strong> &mdash;
                ${isEn ? 'Find the exact lecture or full course you need.' : 'Пронајдете ја точната предавање или целосен курс што ви е потребен.'}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:32px;height:32px;background-color:${BRAND.colorLight};border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;font-weight:700;color:${BRAND.color};">2</td>
              <td style="padding-left:12px;font-size:14px;color:${BRAND.textMuted};line-height:1.5;">
                <strong>${isEn ? 'Book a session' : 'Резервирајте сесија'}</strong> &mdash;
                ${isEn ? 'Choose single lectures or full course bundles.' : 'Изберете поединечни предавања или целосни пакети.'}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:32px;height:32px;background-color:${BRAND.colorLight};border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;font-weight:700;color:${BRAND.color};">3</td>
              <td style="padding-left:12px;font-size:14px;color:${BRAND.textMuted};line-height:1.5;">
                <strong>${isEn ? 'Learn and succeed' : 'Учете и успејте'}</strong> &mdash;
                ${isEn ? 'Attend sessions, earn XP, and ace your exams!' : 'Присуствувајте на сесии, заработете XP и положете ги испитите!'}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton(isEn ? 'Explore Courses' : 'Разгледај Курсеви', `${BRAND.siteUrl}/courses`)}
    <div style="background-color:${BRAND.colorLight};border-radius:6px;padding:16px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:14px;color:${BRAND.textDark};font-weight:600;">
        ${isEn ? 'Questions? We\'re here to help!' : 'Прашања? Тука сме да помогнеме!'}
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.textMuted};">
        <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};text-decoration:none;">${BRAND.supportEmail}</a>
        &nbsp;&bull;&nbsp;
        <a href="https://wa.me/${BRAND.whatsapp.replace(/\+/g, '')}" style="color:${BRAND.color};text-decoration:none;">WhatsApp</a>
      </p>
    </div>`;

  return { subject, html: wrapLayout(body, subject) };
}

// ---------------------------------------------------------------------------
// Template registry and public helper
// ---------------------------------------------------------------------------
export type EmailTemplateType =
  | 'booking_approved'
  | 'booking_rejected'
  | 'session_scheduled'
  | 'review_request'
  | 'welcome';

const templateMap: Record<EmailTemplateType, (data: Record<string, string>, lang: Language) => EmailOutput> = {
  booking_approved: (data, lang) => bookingApproved({
    studentName: data.studentName ?? '',
    courseName: data.courseName ?? '',
    discordLink: data.discordLink,
    dashboardUrl: data.dashboardUrl,
  }, lang),
  booking_rejected: (data, lang) => bookingRejected({
    studentName: data.studentName ?? '',
    courseName: data.courseName ?? '',
    reason: data.reason,
  }, lang),
  session_scheduled: (data, lang) => sessionScheduled({
    studentName: data.studentName ?? '',
    courseName: data.courseName ?? '',
    sessionTitle: data.sessionTitle ?? '',
    sessionDate: data.sessionDate ?? '',
    sessionTime: data.sessionTime ?? '',
    dashboardUrl: data.dashboardUrl,
  }, lang),
  review_request: (data, lang) => reviewRequest({
    studentName: data.studentName ?? '',
    courseName: data.courseName ?? '',
    professorName: data.professorName ?? '',
    reviewUrl: data.reviewUrl,
  }, lang),
  welcome: (data, lang) => welcome({
    studentName: data.studentName ?? '',
    dashboardUrl: data.dashboardUrl,
  }, lang),
};

/**
 * Returns a rendered email template with subject and HTML body.
 *
 * @param type - One of the supported template types
 * @param data - Key/value pairs to populate the template
 * @param language - 'en' for English, 'mk' for Macedonian
 * @returns { subject, html } ready for sending via Supabase/Resend/SMTP
 *
 * @example
 * const email = getEmailTemplate('booking_approved', {
 *   studentName: 'Ana',
 *   courseName: 'Data Structures',
 *   discordLink: 'https://discord.gg/xyz',
 * }, 'mk');
 */
export function getEmailTemplate(
  type: string,
  data: Record<string, string>,
  language: Language = 'en',
): EmailOutput {
  const builder = templateMap[type as EmailTemplateType];
  if (!builder) {
    throw new Error(`Unknown email template type: "${type}". Valid types: ${Object.keys(templateMap).join(', ')}`);
  }
  return builder(data, language);
}

// Named exports for direct usage
export {
  bookingApproved,
  bookingRejected,
  sessionScheduled,
  reviewRequest,
  welcome,
};

export type {
  BookingApprovedData,
  BookingRejectedData,
  SessionScheduledData,
  ReviewRequestData,
  WelcomeData,
  EmailOutput,
  Language as EmailLanguage,
};
