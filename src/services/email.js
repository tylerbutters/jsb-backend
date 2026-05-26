import nodemailer from "nodemailer"

function hasSmtpConfig() {
	return Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM)
}

function getSmtpTransport() {
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		secure: process.env.SMTP_SECURE === "true",
		auth:
			process.env.SMTP_USER && process.env.SMTP_PASS
				? {
						user: process.env.SMTP_USER,
						pass: process.env.SMTP_PASS,
					}
				: undefined,
	})
}

export async function sendPasswordResetCode({ email, code }) {
	if (!hasSmtpConfig()) {
		if (process.env.NODE_ENV === "production") {
			throw new Error("SMTP password reset email is not configured.")
		}

		console.info(`Password reset code for ${email}: ${code}`)
		return
	}

	const transport = getSmtpTransport()

	await transport.sendMail({
		from: process.env.EMAIL_FROM,
		to: email,
		subject: "Your Japanese Sentence Builder password reset code",
		text: [
			"Use this code to reset your password:",
			"",
			code,
			"",
			"This code expires in 10 minutes. If you did not request it, you can ignore this email.",
		].join("\n"),
	})
}
