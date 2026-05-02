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
 * Send ban/unban notification to customer.
 */
const sendBanEmail = async (to, name, reason, isUnbanned = false) => {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_mailtrap_username') {
        console.log(`[MAILER] Would send ${isUnbanned ? 'unban' : 'ban'} email to ${to}`)
        return
    }

    const transporter = getTransporter()
    const subject = isUnbanned 
        ? '🔓 Your Account Has Been Reinstated — Coolie Hire' 
        : '🚫 Your Account Has Been Banned — Coolie Hire'
    
    const title = isUnbanned ? 'Account Reinstated' : 'Account Banned'
    const color = isUnbanned ? '#22c55e' : '#ef4444'

    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Coolie Hire Security" <security@cooliehire.in>',
        to,
        subject,
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:${color};margin-top:0">${title}</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your account on the <strong>Coolie Hiring Platform</strong> has been ${isUnbanned ? '<strong>reinstated</strong>' : '<strong>banned</strong>'}.</p>
          ${!isUnbanned && reason ? `
          <div style="background:#1e293b;border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:0;color:#fca5a5"><strong>Reason for Ban:</strong> ${reason}</p>
          </div>
          ` : ''}
          ${isUnbanned ? `
          <p>You can now log in and use our services as usual. We appreciate your cooperation.</p>
          ` : `
          <p>If you believe this is a mistake, please contact our support team at <a href="mailto:support@cooliehire.in" style="color:#f97316">support@cooliehire.in</a>.</p>
          `}
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

/**
 * Business registration received email.
 */
const sendBusinessRegistrationEmail = async (to, ownerName, businessName) => {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_mailtrap_username') {
        console.log(`[MAILER] Would send business registration email to ${to} for: ${businessName}`)
        return
    }
    const transporter = getTransporter()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CoolieSeva Business" <noreply@cooliehire.in>',
        to,
        subject: '📝 Business Registration Received — CoolieSeva',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:#7B2FFF;margin-top:0">📝 Registration Received</h2>
          <p>Hi <strong>${ownerName}</strong>,</p>
          <p>Thank you for registering <strong>${businessName}</strong> on <strong>CoolieSeva</strong>!</p>
          <div style="background:#1e293b;border-left:4px solid #7B2FFF;padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:0;color:#cbd5e1">Your business details are under review by our admin team. This typically takes <strong>24–48 hours</strong>.</p>
          </div>
          <p>Once your business details are approved (Level 1), you will receive another email with login instructions.</p>
          <p style="color:#64748b;font-size:13px;margin-top:32px">© CoolieSeva Business Portal</p>
        </div>
        `
    })
}

/**
 * Business Level 1 approval email (business details approved by admin).
 */
const sendBusinessLevel1ApprovalEmail = async (to, ownerName, businessName) => {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_mailtrap_username') {
        console.log(`[MAILER] Would send business Level 1 approval email to ${to}`)
        return
    }
    const transporter = getTransporter()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CoolieSeva Business" <noreply@cooliehire.in>',
        to,
        subject: '✅ Business Details Approved (Level 1) — CoolieSeva',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:#22c55e;margin-top:0">✅ Level 1 Approved!</h2>
          <p>Hi <strong>${ownerName}</strong>,</p>
          <p>Great news! Your business <strong>${businessName}</strong> has passed <strong>Level 1 verification</strong> (Business Details Review).</p>
          <div style="background:#1e293b;border-left:4px solid #22c55e;padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:0;color:#cbd5e1">🎯 <strong>Next Step:</strong> You can now log in to the Business Portal to complete your profile. Your account will go through <strong>Level 2 (Owner Identity Verification)</strong> by our Super Admin team.</p>
          </div>
          <p>Once fully verified, your listing will go live on CoolieSeva!</p>
          <p style="color:#64748b;font-size:13px;margin-top:32px">© CoolieSeva Business Portal</p>
        </div>
        `
    })
}

/**
 * Business Level 2 approval email (owner verified by super admin, full access granted).
 */
const sendBusinessLevel2ApprovalEmail = async (to, ownerName, businessName) => {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_mailtrap_username') {
        console.log(`[MAILER] Would send business Level 2 approval email to ${to}`)
        return
    }
    const transporter = getTransporter()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CoolieSeva Business" <noreply@cooliehire.in>',
        to,
        subject: '🎉 Your Business is Fully Approved & Live! — CoolieSeva',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:#22c55e;margin-top:0">🎉 Fully Approved & Live!</h2>
          <p>Hi <strong>${ownerName}</strong>,</p>
          <p>Congratulations! <strong>${businessName}</strong> has completed <strong>both levels of verification</strong> and is now <strong>live on CoolieSeva</strong>!</p>
          <div style="background:#1e293b;border:1px solid #22c55e;padding:20px;border-radius:12px;margin:20px 0;text-align:center">
            <p style="margin:0;font-size:13px;color:#94a3b8">Status</p>
            <h1 style="margin:8px 0;color:#22c55e;font-size:24px">✅ LIVE & ACTIVE</h1>
          </div>
          <p>You can now log in to your Owner Dashboard to manage your menu, rooms, bookings, and more!</p>
          <p style="color:#64748b;font-size:13px;margin-top:32px">© CoolieSeva Business Portal</p>
        </div>
        `
    })
}

/**
 * Business rejection email.
 */
const sendBusinessRejectionEmail = async (to, ownerName, businessName, reason) => {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_mailtrap_username') {
        console.log(`[MAILER] Would send business rejection email to ${to}`)
        return
    }
    const transporter = getTransporter()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CoolieSeva Business" <noreply@cooliehire.in>',
        to,
        subject: '❌ Business Application — Action Required — CoolieSeva',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
          <h2 style="color:#ef4444;margin-top:0">Application Needs Attention</h2>
          <p>Hi <strong>${ownerName}</strong>,</p>
          <p>Unfortunately, your application for <strong>${businessName}</strong> could not be approved at this time.</p>
          ${reason ? `<div style="background:#1e293b;border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:20px 0"><p style="margin:0;color:#fca5a5"><strong>Reason:</strong> ${reason}</p></div>` : ''}
          <p>Please contact our support team at <a href="mailto:support@cooliehire.in" style="color:#7B2FFF">support@cooliehire.in</a> for assistance.</p>
          <p style="color:#64748b;font-size:13px;margin-top:32px">© CoolieSeva Business Portal</p>
        </div>
        `
    })
}

module.exports = { 
    sendLockoutEmail, 
    sendApprovalEmail, 
    sendRejectionEmail,
    sendRegistrationReceivedEmail,
    sendBanEmail,
    sendBusinessRegistrationEmail,
    sendBusinessLevel1ApprovalEmail,
    sendBusinessLevel2ApprovalEmail,
    sendBusinessRejectionEmail
}
