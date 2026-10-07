function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function layout({ preheader, heading, body, buttonLabel, buttonUrl, footer = 'AEGIS FORGE SYSTEM' }) {
  const button = buttonUrl
    ? `<p style="margin:28px 0"><a href="${escapeHtml(buttonUrl)}" style="display:inline-block;padding:13px 19px;background:#a4f276;color:#14200f;text-decoration:none;font-weight:700;border-radius:4px">${escapeHtml(buttonLabel)}</a></p><p style="font-size:12px;line-height:1.6;color:#a9b4ac">If the button does not work, use this link:<br><a href="${escapeHtml(buttonUrl)}" style="color:#a4f276;word-break:break-all">${escapeHtml(buttonUrl)}</a></p>`
    : '';

  return `<!doctype html><html lang="en"><body style="margin:0;background:#eef1ed;font-family:Arial,sans-serif;color:#172019"><span style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</span><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1ed;padding:34px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #dce2da"><tr><td style="padding:27px 32px;background:#17211b;color:#fff"><div style="font-size:12px;letter-spacing:1.5px;font-weight:700">AEGIS FORGE SYSTEM</div><div style="margin-top:5px;color:#a4f276;font-size:11px">Technology, built together</div></td></tr><tr><td style="padding:34px 32px 31px"><h1 style="margin:0 0 16px;font-size:25px;line-height:1.2;color:#172019">${escapeHtml(heading)}</h1>${body}${button}<p style="margin:28px 0 0;border-top:1px solid #e1e6df;padding-top:18px;color:#687269;font-size:12px;line-height:1.6">${escapeHtml(footer)}</p></td></tr></table></td></tr></table></body></html>`;
}

export function contactNotificationTemplate({ name, email, subject, department, message }) {
  const escapedMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const html = layout({
    preheader: `New inquiry for ${department}`,
    heading: 'A new contact inquiry',
    body: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.7"><tr><td style="padding:5px 0;color:#687269;width:130px">From</td><td style="padding:5px 0">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</td></tr><tr><td style="padding:5px 0;color:#687269">Department</td><td style="padding:5px 0">${escapeHtml(department)}</td></tr><tr><td style="padding:5px 0;color:#687269">Subject</td><td style="padding:5px 0">${escapeHtml(subject)}</td></tr></table><div style="margin-top:20px;padding:17px;background:#f3f6f1;line-height:1.7;white-space:normal">${escapedMessage}</div>`,
    footer: 'Reply directly to this email to contact the sender.',
  });
  const text = `New contact inquiry\nFrom: ${name} <${email}>\nDepartment: ${department}\nSubject: ${subject}\n\n${message}\n\nReply directly to this email to contact the sender.`;
  return { html, text };
}

export function verificationEmailTemplate({ name, verificationUrl, expiresInMinutes }) {
  const greeting = name ? `Hello ${escapeHtml(name)},` : 'Hello,';
  return {
    subject: 'Verify your AEGIS FORGE SYSTEM account',
    html: layout({
      preheader: 'Confirm your email to activate your account.',
      heading: 'Verify your email address',
      body: `<p style="font-size:15px;line-height:1.7;color:#424c44">${greeting}</p><p style="font-size:15px;line-height:1.7;color:#424c44">Confirm your email address to finish creating your AEGIS FORGE SYSTEM account.</p>`,
      buttonLabel: 'Verify email address',
      buttonUrl: verificationUrl,
      footer: `This link expires in ${expiresInMinutes} minutes. If you did not create this account, you can ignore this email.`,
    }),
    text: `Verify your AEGIS FORGE SYSTEM email address: ${verificationUrl}\n\nThis link expires in ${expiresInMinutes} minutes. If you did not create this account, ignore this email.`,
  };
}

export function passwordResetEmailTemplate({ resetUrl, expiresInMinutes }) {
  return {
    subject: 'Reset your AEGIS FORGE SYSTEM password',
    html: layout({
      preheader: 'Use the secure link to choose a new password.',
      heading: 'Reset your password',
      body: '<p style="font-size:15px;line-height:1.7;color:#424c44">We received a request to reset the password for your AEGIS FORGE SYSTEM account.</p>',
      buttonLabel: 'Choose a new password',
      buttonUrl: resetUrl,
      footer: `This link expires in ${expiresInMinutes} minutes. If you did not request a password reset, ignore this email. Your password will not change unless you use the link.`,
    }),
    text: `Reset your AEGIS FORGE SYSTEM password: ${resetUrl}\n\nThis link expires in ${expiresInMinutes} minutes. If you did not request this, ignore this email.`,
  };
}