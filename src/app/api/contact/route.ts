import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, botField } = body;

    // Honeypot check for spam prevention
    if (botField) {
      console.warn("Spam bot detected. botField was filled.");
      // Return a fake success response
      return NextResponse.json(
        { message: "Message sent successfully" },
        { status: 201 }
      );
    }

    // Simple validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields (Name, Email, and Message are required)" },
        { status: 400 }
      );
    }

    const cleanSubject = subject && subject.trim() ? subject.trim() : "General Inquiry";

    // Save to database
    let contact;
    try {
      contact = await prisma.contactMessage.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : "",
          subject: cleanSubject,
          message: message.trim(),
          isRead: false,
          status: "Unread",
        },
      });
    } catch (dbError) {
      console.error("Error saving contact message to DB:", dbError);
    }

    // Check if email credentials are provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured in environment variables. Skipping email send.");
      if (contact) {
        return NextResponse.json(
          { message: "Message saved to DB, but email not sent (no config)", data: contact },
          { status: 201 }
        );
      } else {
        throw new Error("Missing email credentials and DB save failed.");
      }
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email to admin
    try {
      await transporter.sendMail({
        from: `"Pinaka Fitness Contact" <${process.env.EMAIL_USER}>`,
        to: "abhishekjaiswal.contact@gmail.com",
        subject: `New Contact Form Submission: ${cleanSubject} (${name})`,
        text: `
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${cleanSubject}
Message:
${message}
        `,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4F46E5;">New Contact Form Submission</h2>
            <p>You have received a new message from the Pinaka Fitness contact form.</p>
            <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 120px;">Name</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${phone || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Subject</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${cleanSubject}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Message</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${message.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">This email was sent automatically from your website.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Nodemailer failed to send email:", emailError);
      // If we saved to DB, we still return success to the user
      if (contact) {
        return NextResponse.json(
          { message: "Message received (saved to DB, email pending)", data: contact },
          { status: 201 }
        );
      }
      // If DB save failed too, then we throw
      throw emailError;
    }

    return NextResponse.json(
      { message: "Message sent successfully", data: contact },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error handling contact submission:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please check your connection and try again." },
      { status: 500 }
    );
  }
}
