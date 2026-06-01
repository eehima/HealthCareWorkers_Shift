const sendBrevoEmail = async ({ to, subject, htmlContent, textContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = process.env.SENDER_NAME || 'HealthCareWorkers';

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }
  if (!senderEmail) {
    throw new Error('SENDER_EMAIL is not configured');
  }

  const emailBody = {
    sender: {
      email: senderEmail,
      name: senderName,
    },
    to: [
      {
        email: to,
      },
    ],
    subject,
    htmlContent,
    textContent,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(emailBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo email send failed: ${response.status} ${errorText}`);
  }
};

export const sendVerificationEmail = async ({ to, otp }) => {
  const htmlContent = `
    <h2>Your verification code</h2>
    <p>Use the following OTP to verify your account:</p>
    <p style="font-size: 24px; font-weight: bold;">${otp}</p>
    <p>This code expires in 10 minutes.</p>
  `;
  const textContent = `Your verification code is: ${otp}. It expires in 10 minutes.`;

  return sendBrevoEmail({
    to,
    subject: 'Your verification code',
    htmlContent,
    textContent,
  });
};

export const sendPasswordResetEmail = async ({ to, otp }) => {
  const htmlContent = `
    <h2>Password reset code</h2>
    <p>Use the following OTP to reset your password:</p>
    <p style="font-size: 24px; font-weight: bold;">${otp}</p>
    <p>This code expires in 10 minutes.</p>
  `;
  const textContent = `Your password reset code is: ${otp}. It expires in 10 minutes.`;

  return sendBrevoEmail({
    to,
    subject: 'Password Reset Code',
    htmlContent,
    textContent,
  });
};
