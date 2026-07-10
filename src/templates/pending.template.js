module.exports = ({ name, amount, currency, reference }) => ({
  subject: `Transaction Pending: ${currency} ${amount}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#b45309;">Transaction Processing</h2>
      <p>Hi ${name},</p>
      <p>Your transaction of <b>${currency} ${amount}</b> is being processed.</p>
      <p>Reference: ${reference}</p>
      <p style="color:#666; font-size:12px; margin-top:16px;">We'll notify you once it completes.</p>
    </div>
  `,
});
