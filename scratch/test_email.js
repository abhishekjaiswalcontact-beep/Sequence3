require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'undefined');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing credentials');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log('Attempting to send test email...');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'abhishekjaiswal.contact@gmail.com',
      subject: 'Test Email from Script',
      text: 'If you see this, the configuration is correct.',
    });
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
}

testEmail();
