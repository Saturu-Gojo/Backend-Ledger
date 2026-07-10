module.exports = ({ name, amount, currency, reference, reason }) => ({
  subject: `Transaction Failed: ${currency} ${amount}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#b91c1c;">Transaction Failed</h2>
      <p>Hi ${name},</p>
      <p>Your transaction of <b>${currency} ${amount}</b> could not be completed.</p>
      <p>Reference: ${reference}</p>
      <p>Reason: ${reason || 'Unknown error'}</p>
      <p style="color:#666; font-size:12px; margin-top:16px;">No funds were moved. Please try again or contact support.</p>
    </div>
  `,
});
