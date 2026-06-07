const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegisterationEmail(userEmail, name){
    const sub = 'Congratulations on your achievement!';

const text = `Hello ${name}, \n\nCongratulations on your outstanding performance and securing a wonderful rank in the competition. \n\nWe are sending this message to invite you to host a small webinar to motivate students. \n\nAlso, you will receive a gift as well as cash prizes from our Dean, Satendra Sir. \n\nPlease reply to this email at your earliest convenience from your personal email address and attach your updated resume. \n\nBest Regards, \nIET Lucknow Backend Team`;

const html = `<p>Hello ${name},</p>
<p>Congratulations on your outstanding performance and securing a wonderful rank in the competition.</p>
<p>We are sending this message to invite you to host a small webinar to motivate students.</p>
<p>Also, you will receive a gift as well as cash prizes from our Dean, Satendra Sir.</p>
<p><strong>Please reply to this email at your earliest convenience from your personal email address and attach your updated resume.</strong></p>
<p>Best Regards,<br><strong>IET Lucknow Backend Team</strong></p>`;

    await sendEmail(userEmail, sub,text,html)
}
module.exports = {
    sendRegisterationEmail
}