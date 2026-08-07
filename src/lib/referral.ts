import { prisma } from './prisma';
import nodemailer from 'nodemailer';
import { formatPhoneNumber } from './whatsapp';

/**
 * Generates a unique, short, easy-to-read referral code.
 * Example format: PINA-1234
 */
export async function generateReferralCode(): Promise<string> {
  const chars = '0123456789';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = 'PINA-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check uniqueness in database
    const existing = await prisma.referralCode.findUnique({
      where: { code },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}

/**
 * Self-healing migration backfill: ensures all existing users who do not have a referral code automatically get one.
 */
export async function backfillReferralCodes() {
  try {
    const usersWithoutCode = await prisma.user.findMany({
      where: {
        referralCode: null,
      },
      select: {
        id: true,
      },
    });

    if (usersWithoutCode.length === 0) return;

    console.log(`[Referral Backfill] Found ${usersWithoutCode.length} users without a referral code. Starting migration...`);

    for (const u of usersWithoutCode) {
      const code = await generateReferralCode();
      await prisma.referralCode.create({
        data: {
          code,
          userId: u.id,
        },
      }).catch((err) => {
        console.error(`[Referral Backfill] Failed to generate code for userId ${u.id}:`, err);
      });
    }

    console.log('[Referral Backfill] Migration completed.');
  } catch (error) {
    console.error('[Referral Backfill Error]', error);
  }
}

/**
 * Sends notifications to Admin, Referrer, and New Member via In-App, Email, and WhatsApp.
 */
export async function sendReferralNotifications(referrerId: number, referredId: number, codeUsed: string) {
  try {
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
    });
    const referred = await prisma.user.findUnique({
      where: { id: referredId },
    });

    if (!referrer || !referred) {
      console.warn('[Referral Notifications] Referrer or Referred user not found.');
      return;
    }

    const adminEmail = process.env.EMAIL_USER || 'abhishekjaiswal.contact@gmail.com';

    // 1. In-App Notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: referrer.id,
          title: 'Referral Successful! 🎁',
          message: `Congratulations! Your friend ${referred.name} joined PINAKA FITNESS using your referral code (${codeUsed}).`,
        },
        {
          userId: referred.id,
          title: 'Welcome to PINAKA FITNESS! 🏋️',
          message: `You've successfully signed up using ${referrer.name}'s referral code. Let's hit those goals!`,
        },
      ],
    });

    // 2. Email Notifications (using Nodemailer Gmail transport)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      // Send to Admin
      await transporter.sendMail({
        from: `"PINAKA FITNESS Referrals" <${emailUser}>`,
        to: adminEmail, // Admin contact address
        subject: `New Gym Referral: ${referred.name} referred by ${referrer.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #8b5cf6;">Successful Referral Registered</h2>
            <p>A new member has signed up using a referral code.</p>
            <ul>
              <li><strong>Referrer:</strong> ${referrer.name} (${referrer.email})</li>
              <li><strong>Referred Member:</strong> ${referred.name} (${referred.email})</li>
              <li><strong>Code Used:</strong> ${codeUsed}</li>
              <li><strong>Join Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
        `,
      }).catch(err => console.error('[Nodemailer Admin Email Error]', err));

      // Send to Referrer
      await transporter.sendMail({
        from: `"PINAKA FITNESS" <${emailUser}>`,
        to: referrer.email,
        subject: `Your friend ${referred.name} has joined! 🎁`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #8b5cf6;">Congratulations ${referrer.name}!</h2>
            <p>Your friend <strong>${referred.name}</strong> just joined PINAKA FITNESS using your referral code: <strong>${codeUsed}</strong>.</p>
            <p>Thank you for helping grow our fitness community. Your referral reward progression has been updated on your dashboard.</p>
            <br>
            <p>Keep grinding,</p>
            <p><strong>PINAKA FITNESS Team</strong></p>
          </div>
        `,
      }).catch(err => console.error('[Nodemailer Referrer Email Error]', err));

      // Send to New Member
      await transporter.sendMail({
        from: `"PINAKA FITNESS" <${emailUser}>`,
        to: referred.email,
        subject: `Welcome to PINAKA FITNESS! 🏋️`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #8b5cf6;">Welcome to the Gym, ${referred.name}!</h2>
            <p>We are excited to have you start your fitness journey with us.</p>
            <p>You signed up using <strong>${referrer.name}</strong>'s referral code. Let's work together to smash your goals!</p>
            <br>
            <p>In health and strength,</p>
            <p><strong>PINAKA FITNESS Team</strong></p>
          </div>
        `,
      }).catch(err => console.error('[Nodemailer Referred Email Error]', err));
    } else {
      console.warn('[Referral Notifications] Nodemailer credentials missing, skipping emails.');
    }

    // 3. WhatsApp Notifications (using Meta or Twilio API credentials)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const metaToken = process.env.WHATSAPP_META_ACCESS_TOKEN;

    if ((twilioSid && twilioToken) || metaToken) {
      // Send WhatsApp message to Referrer
      const referrerPhone = formatPhoneNumber(referrer.phone);
      if (referrerPhone) {
        const msg = `🏋️ PINAKA FITNESS\n\nHi ${referrer.name},\n\nCongratulations! Your friend ${referred.name} has joined PINAKA FITNESS using your referral code (${codeUsed}).\n\nCheck your reward progress on your dashboard!\n\n— PINAKA FITNESS`;
        await sendWhatsAppDirect(referrerPhone, msg).catch((err) => {
          console.error('[Referral Notifications] WhatsApp failed to send to referrer:', err);
        });
      }

      // Send WhatsApp message to New Member
      const referredPhone = formatPhoneNumber(referred.phone);
      if (referredPhone) {
        const msg = `🏋️ PINAKA FITNESS\n\nWelcome ${referred.name}!\n\nYou've successfully joined PINAKA FITNESS using ${referrer.name}'s referral code.\n\nLet's get stronger together!\n\n— PINAKA FITNESS`;
        await sendWhatsAppDirect(referredPhone, msg).catch((err) => {
          console.error('[Referral Notifications] WhatsApp failed to send to referred user:', err);
        });
      }
    } else {
      console.log('[Referral Notifications] WhatsApp credentials not configured, skipping WhatsApp notifications.');
    }
  } catch (error) {
    console.error('[Referral Notifications Dispatch Error]', error);
  }
}

/**
 * Basic direct WhatsApp sender leveraging Twilio or Meta configurations
 */
async function sendWhatsAppDirect(toPhone: string, bodyText: string): Promise<boolean> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM;

  const metaToken = process.env.WHATSAPP_META_ACCESS_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_META_PHONE_NUMBER_ID;
  const metaApiVer = process.env.WHATSAPP_META_API_VERSION || 'v20.0';

  if (twilioSid && twilioToken && twilioFrom) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
    const bodyParams = new URLSearchParams({
      From: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
      To: `whatsapp:${toPhone}`,
      Body: bodyText,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });
    return res.ok;
  } else if (metaToken && metaPhoneId) {
    const url = `https://graph.facebook.com/${metaApiVer}/${metaPhoneId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone.replace('+', ''),
      type: 'text',
      text: { body: bodyText },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${metaToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  }
  return false;
}
