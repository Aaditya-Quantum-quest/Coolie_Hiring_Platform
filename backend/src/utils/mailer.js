const nodemailer = require('nodemailer')

/**
 * Lazy transporter — only created when actually needed.
 * Add SMTP settings to .env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * For development: use Mailtrap.io (free) or Gmail with app password
 */
const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
        },
    })
}

/**
 * Send account lockout alert email to coolie.
 */
const sendLockoutEmail = async (to, name) => {
    // If SMTP not configured, just log it
    if (!process.env.SMTP_USER) {
        console.warn(`[MAILER] SMTP not configured. Would have sent lockout email to: ${to}`)
        return
    }

    const transporter = getTransporter()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Coolie Hire Security" <security@cooliehire.in>',
        to,
        subject: '⚠️ Security Alert: Your Account Has Been Temporarily Locked',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:#f97316;margin-top:0">⚠️ Account Temporarily Locked</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your account has been <strong>temporarily locked</strong> due to <strong>5 consecutive failed login attempts</strong>.</p>
          <div style="background:#1e293b;border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:0;color:#fca5a5">🔒 Lock duration: <strong>30 minutes</strong></p>
          </div>
          <p>If this was not you, your account may be under attack. Please:</p>
          <ul>
            <li>Wait 30 minutes, then login and change your password immediately</li>
            <li>Contact our support team if you believe this is unauthorized</li>
          </ul>
          <p style="color:#64748b;font-size:13px;margin-top:32px">
            © Coolie Hire Platform · This is an automated security alert
          </p>
        </div>
        `
    })
}

/**
 * Send registration confirmation to coolie immediately after signing up.
 */
const sendRegistrationReceivedEmail = async (to, name) => {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_mailtrap_username') {
        console.log(`[MAILER] Would send registration received email to ${to}`)
        return
    }

    const transporter = getTransporter()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Coolie Hire" <noreply@cooliehire.in>',
        to,
        subject: '📝 Registration Received — Coolie Hiring Platform',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:#f97316;margin-top:0">📝 Registration Received</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for registering on the <strong>Coolie Hiring Platform</strong>.</p>
          <div style="background:#1e293b;border-left:4px solid #f97316;padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:0;color:#cbd5e1">Your documents have been submitted for verification. It will take <strong>two or three days</strong> to confirm your registration.</p>
          </div>
          <p>Once approved, you will receive another email containing your unique <strong>Coolie ID</strong> which you can use to log in and start working.</p>
          <p style="color:#64748b;font-size:13px;margin-top:32px">© Coolie Hire Platform</p>
        </div>
        `
    })
}

/**
 * Send approval notification to coolie after admin verification.
 */
const sendApprovalEmail = async (to, name, coolieId, password) => {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_mailtrap_username') {
        console.log(`[MAILER] Would send approval email to ${to}. Coolie ID: ${coolieId}`)
        return
    }

    const transporter = getTransporter()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Coolie Hire" <noreply@cooliehire.in>',
        to,
        subject: '✅ Your Coolie Account is Approved!',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:#22c55e;margin-top:0">✅ Account Approved!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your coolie account has been <strong>verified and approved</strong> by our admin team.</p>
          <div style="background:#1e293b;border:1px solid #f97316;padding:20px;border-radius:12px;margin:20px 0;text-align:center">
            <p style="margin:0;font-size:13px;color:#94a3b8">Your Unique Coolie ID</p>
            <h1 style="margin:8px 0;color:#f97316;font-size:28px;font-family:monospace;letter-spacing:2px">${coolieId}</h1>
          </div>
          <p>You can now log in using these credentials:</p>
          <div style="background:#1e293b;padding:16px;border-radius:8px;margin:16px 0">
            <p style="margin:4px 0"><strong>Coolie ID:</strong> ${coolieId}</p>
            <p style="margin:4px 0"><strong>Password:</strong> ${password || '(the password you set during registration)'}</p>
          </div>
          <p style="color:#64748b;font-size:13px;margin-top:32px">© Coolie Hire Platform</p>
        </div>
        `
    })
}

/**
 * Send rejection notification to coolie.
 */
const sendRejectionEmail = async (to, name, reason) => {
    if (!process.env.SMTP_USER) {
        console.log(`[MAILER] Would send rejection email to ${to}`)
        return
    }

    const transporter = getTransporter()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Coolie Hire" <noreply@cooliehire.in>',
        to,
        subject: '❌ Coolie Account Application — Action Required',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:#ef4444;margin-top:0">Application Needs Attention</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your coolie account application could not be approved at this time.</p>
          ${reason ? `<div style="background:#1e293b;border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:20px 0"><p style="margin:0;color:#fca5a5"><strong>Reason:</strong> ${reason}</p></div>` : ''}
          <p>Please resubmit your application with correct documents or contact our support team.</p>
          <p style="color:#64748b;font-size:13px;margin-top:32px">© Coolie Hire Platform</p>
        </div>
        `
    })
}

module.exports = { 
    sendLockoutEmail, 
    sendApprovalEmail, 
    sendRejectionEmail,
    sendRegistrationReceivedEmail
}
