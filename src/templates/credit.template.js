module.exports = ({
  name,
  amount,
  currency,
  accountNumber,
  balanceAfter,
  reference,
}) => ({
  subject: `Credit Alert: ${currency} ${amount} received`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#15803d;">Credit Alert</h2>
      <p>Hi ${name},</p>
      <p>Your account <b>${accountNumber}</b> was credited.</p>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:6px 0;">Amount</td><td style="text-align:right;"><b>${currency} ${amount}</b></td></tr>
        <tr><td style="padding:6px 0;">Balance after</td><td style="text-align:right;">${currency} ${balanceAfter}</td></tr>
        <tr><td style="padding:6px 0;">Reference</td><td style="text-align:right;">${reference}</td></tr>
      </table>
      <p style="color:#666; font-size:12px; margin-top:16px;">Thank you for banking with us.</p>
    </div>
  `,
});
