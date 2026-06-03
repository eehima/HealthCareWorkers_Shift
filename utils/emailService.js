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

// send notification email to worker when they are assigned to a shift
export const sendShiftAssignmentEmail = async ({ to, shiftDetails }) => {
  const htmlContent = `
    <h2>New Shift Assignment</h2>
    <p>You have been assigned to a new shift with the following details:</p>
    <ul>
      <li><strong>Shift ID:</strong> ${shiftDetails._id}</li>
      <li><strong>Start Time:</strong> ${new Date(shiftDetails.startTime).toLocaleString()}</li>
      <li><strong>End Time:</strong> ${new Date(shiftDetails.endTime).toLocaleString()}</li>
      <li><strong>Facility:</strong> ${shiftDetails.facilityId?.name || 'N/A'}</li>
    </ul>
  `;
  const textContent = `You have been assigned to a new shift with the following details:
- Shift ID: ${shiftDetails._id}
- Start Time: ${new Date(shiftDetails.startTime).toLocaleString()}
- End Time: ${new Date(shiftDetails.endTime).toLocaleString()}
- Facility: ${shiftDetails.facilityId?.name || 'N/A'}`;

  return sendBrevoEmail({
    to,
    subject: 'New Shift Assignment',
    htmlContent,
    textContent,
  });
};