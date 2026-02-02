// api/contact.js
// This is a Vercel serverless function

const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, message } = req.body;

  // Validate input
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Configure email transporter
    // You'll need to set these as environment variables in Vercel
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or 'smtp.gmail.com'
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'eliankim.007@gmail.com',
      replyTo: email,
      subject: `New Contact Form Message from ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #000; color: #fff;">
          <h2 style="text-transform: uppercase; letter-spacing: 0.1em;">NEW MESSAGE FROM PORTFOLIO</h2>
          <hr style="border: 1px solid #fff; margin: 20px 0;">
          <p><strong>FROM:</strong> ${email}</p>
          <hr style="border: 1px solid #333; margin: 20px 0;">
          <p><strong>MESSAGE:</strong></p>
          <div style="background: #111; padding: 20px; border-left: 4px solid #fff; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: 1px solid #333; margin: 20px 0;">
          <p style="font-size: 12px; opacity: 0.6;">This message was sent from your portfolio contact form.</p>
        </div>
      `,
      text: `
NEW MESSAGE FROM PORTFOLIO

FROM: ${email}

MESSAGE:
${message}

---
This message was sent from your portfolio contact form.
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
}
