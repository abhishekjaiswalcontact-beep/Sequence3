import { prisma } from './prisma';

interface SendWhatsAppResult {
  success: boolean;
  provider: 'META' | 'TWILIO' | 'NONE';
  messageId?: string;
  error?: string;
}

/**
 * Normalizes phone numbers to E.164 format, default to +91 (India) if 10 digits
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  // 10 digit Indian number
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  // 12 digit Indian number without +
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  return `+${cleaned}`;
}

/**
 * Helper to perform fetch requests with exponential backoff retries on network or 5xx/429 errors.
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, initialDelay = 500): Promise<Response> {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }
      console.warn(`[WhatsApp API] Request failed with status ${response.status}. Retry ${i + 1}/${retries}...`);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[WhatsApp API] Request error: ${(err as Error).message}. Retry ${i + 1}/${retries}...`);
    }
    await new Promise((res) => setTimeout(res, delay));
    delay *= 2; // exponential backoff
  }
  throw new Error(`Failed to send WhatsApp request after ${retries} attempts.`);
}

/**
 * Sends a WhatsApp reminder to a member
 */
export async function sendWhatsAppReminder(
  userId: number,
  phone: string,
  memberName: string,
  dashboardUrl: string
): Promise<SendWhatsAppResult> {
  const normalizedPhone = formatPhoneNumber(phone);
  if (!normalizedPhone) {
    const errorMsg = 'Invalid or empty phone number';
    await logReminder(userId, 'Failed', errorMsg);
    return { success: false, provider: 'NONE', error: errorMsg };
  }

  // Check if Twilio API credentials exist
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g., whatsapp:+14155238886

  // Check if Meta API credentials exist
  const metaToken = process.env.WHATSAPP_META_ACCESS_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_META_PHONE_NUMBER_ID;
  const metaApiVer = process.env.WHATSAPP_META_API_VERSION || 'v20.0';

  const messageText = `🏋️ PINAKA FITNESS\n\nHi ${memberName},\n\nDon't forget to mark today's gym attendance.\n\nClick here:\n${dashboardUrl}\n\nTrack your consistency and maintain your streak!\n\n— PINAKA FITNESS`;

  try {
    if (twilioSid && twilioToken && twilioFrom) {
      // Use Twilio WhatsApp API
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');

      const bodyParams = new URLSearchParams({
        From: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
        To: `whatsapp:${normalizedPhone}`,
        Body: messageText,
      });

      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const data = await res.json();

      if (res.ok) {
        await logReminder(userId, 'Sent');
        return { success: true, provider: 'TWILIO', messageId: data.sid };
      } else {
        const errorMsg = data.message || `Twilio error code ${data.code}`;
        await logReminder(userId, 'Failed', errorMsg);
        return { success: false, provider: 'TWILIO', error: errorMsg };
      }

    } else if (metaToken && metaPhoneId) {
      // Use Meta WhatsApp Cloud API
      const url = `https://graph.facebook.com/${metaApiVer}/${metaPhoneId}/messages`;
      
      // Note: Outbound messages outside 24h window usually require Templates on Meta.
      // We will try sending a template message if WHATSAPP_META_TEMPLATE_NAME is defined,
      // otherwise fallback to a standard text message payload.
      const templateName = process.env.WHATSAPP_META_TEMPLATE_NAME || 'gym_attendance_reminder';
      const useTemplate = process.env.WHATSAPP_META_USE_TEMPLATE === 'true' || true; // recommended by default

      let body: Record<string, unknown>;

      if (useTemplate) {
        body = {
          messaging_product: 'whatsapp',
          to: normalizedPhone.replace('+', ''), // Meta requires phone without leading '+'
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: process.env.WHATSAPP_META_TEMPLATE_LANG || 'en_US',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: memberName },
                  { type: 'text', text: dashboardUrl }
                ]
              }
            ]
          }
        };
      } else {
        body = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedPhone.replace('+', ''),
          type: 'text',
          text: {
            body: messageText,
          },
        };
      }

      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        const messageId = data.messages?.[0]?.id;
        await logReminder(userId, 'Sent');
        return { success: true, provider: 'META', messageId };
      } else {
        const errorMsg = data.error?.message || `Meta Graph API error ${data.error?.code}`;
        await logReminder(userId, 'Failed', errorMsg);
        return { success: false, provider: 'META', error: errorMsg };
      }

    } else {
      const errorMsg = 'WhatsApp credentials not configured (Check TWILIO_* or WHATSAPP_META_* environment variables)';
      console.warn(`[WhatsApp API] ${errorMsg}`);
      await logReminder(userId, 'Failed', errorMsg);
      return { success: false, provider: 'NONE', error: errorMsg };
    }
  } catch (err) {
    const errorMsg = (err as Error).message || 'Unknown network error';
    await logReminder(userId, 'Failed', errorMsg);
    return { success: false, provider: 'NONE', error: errorMsg };
  }
}

async function logReminder(userId: number, status: 'Sent' | 'Failed', errorMessage?: string) {
  try {
    await prisma.reminderLog.create({
      data: {
        userId,
        status,
        errorMessage: errorMessage || null,
      },
    });
  } catch (logErr) {
    console.error('[WhatsApp API LOG_ERROR] Failed to write ReminderLog to database:', logErr);
  }
}
