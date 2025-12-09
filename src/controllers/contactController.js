const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');
const Message = require('../models/Message');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.getContact = (req, res) => {
  res.render('contact', {
    name: req.session.userName || '',
    email: req.session.userEmail || '',
    subject: '',
    message: '',
    error: null,
    success: req.query.success ? 'Thanks! Your message has been sent.' : null
  });
};

exports.postContact = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 chars'),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('subject').trim().escape().optional({ checkFalsy: true }),
  body('message').trim().isLength({ min: 5 }).withMessage('Message must be at least 5 chars'),

  async (req, res) => {
    if (!req.session.userId) {
      req.session.pendingContact = req.body;
      return res.redirect('/login');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errMsg = errors.array().map(e => e.msg).join(' | ');
      return res.status(400).render('contact', {
        name: req.session.userName,
        email: req.session.userEmail,
        subject: req.body.subject,
        message: req.body.message,
        error: errMsg,
        success: null
      });
    }

    if (req.body.name !== req.session.userName || req.body.email !== req.session.userEmail) {
      return res.status(400).render('contact', {
        name: req.session.userName,
        email: req.session.userEmail,
        subject: req.body.subject,
        message: req.body.message,
        error: "Name and Email must match your signed-in account.",
        success: null
      });
    }

    try {
      // 💾 Save to DB
      const msgDoc = new Message({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
        userId: req.session.userId,
        ip: req.ip
      });
      await msgDoc.save();

      // 📤 Send confirmation to user (white text)
      try {
        await resend.emails.send({
          from: 'FitHive Support <onboarding@resend.dev>',
          to: req.body.email,
          subject: 'FitHive - We received your message',
          html: `
            <div style="background-color:#111; color:white; font-family:Arial, sans-serif; padding:20px;">
              <p>Hi ${req.body.name},</p>
              <p>We’ve received your message and our team is reviewing it. You can expect a reply within 24–48 hours.</p>
              <br>
              <p>Thank you for contacting FitHive Support.</p>
              <p>- FitHive Support Team</p>
            </div>
          `
        });
        console.log(` Confirmation email sent to user: ${req.body.email}`);
      } catch (err) {
        console.error(' Failed to send user confirmation:', err.message);
      }

      // 📩 Send notification to admin (white text)
      try {
        await resend.emails.send({
          from: 'FitHive Notifications <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: `New Contact Message – ${req.body.name}`,
          html: `
            <div style="background-color:#111; color:white; font-family:Arial, sans-serif; padding:20px;">
              <p>Hello Admin,</p>
              <p>You’ve received a new message from a user on FitHive.</p>
              <br>
              <p><b>Name:</b> ${req.body.name}</p>
              <p><b>Email:</b> ${req.body.email}</p>
              <p><b>Subject:</b> ${req.body.subject || 'No subject'}</p>
              <p><b>Message:</b><br>${req.body.message}</p>
              <br>
              <p>- FitHive Notifications</p>
            </div>
          `
        });
        console.log(`Admin notification sent to: ${process.env.ADMIN_EMAIL}`);
      } catch (err) {
        console.error(' Failed to send admin notification:', err.message);
      }

      // ✅ Redirect with success query
      res.redirect('/contact?success=1');

    } catch (err) {
      console.error('Contact error:', err);
      res.status(500).render('contact', {
        name: req.session.userName,
        email: req.session.userEmail,
        subject: req.body.subject,
        message: req.body.message,
        error: "Unable to submit message. Please try again later.",
        success: null
      });
    }
  }
];
