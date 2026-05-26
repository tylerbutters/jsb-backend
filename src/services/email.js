import nodemailer from "nodemailer"
import { HttpError } from "../errors.js"

const smtpConfigKeys = ["SMTP_HOST", "EMAIL_FROM"]

function getMissingSmtpConfigKeys() {
	return smtpConfigKeys.filter((key) => !process.env[key])
}

function hasSmtpConfig() {
	return getMissingSmtpConfigKeys().length === 0
}

function createSmtpConfigError() {
	return new HttpError(500, "Password reset email is not configured.", {
		code: "PASSWORD_RESET_EMAIL_NOT_CONFIGURED",
		logMessage: `SMTP password reset email is not configured. Missing env vars: ${getMissingSmtpConfigKeys().join(", ")}`,
	})
}

function createSmtpSendError(error) {
	const smtpDetails = [error.code, error.command, error.responseCode].filter(Boolean).join(" ")

	return new HttpError(502, "Password reset email could not be sent.", {
		code: "PASSWORD_RESET_EMAIL_SEND_FAILED",
		cause: error,
		logMessage: `SMTP password reset email failed${smtpDetails ? ` (${smtpDetails})` : ""}.`,
	})
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
	console.log(process.env.SMTP_HOST)

	if (!hasSmtpConfig()) {
		console.log(process.env)
		if (process.env.NODE_ENV === "production") {
			throw createSmtpConfigError()
		}
		console.info(
			`Password reset code for ${email}: ${code}. SMTP email is not configured; missing env vars: ${getMissingSmtpConfigKeys().join(", ")}`,
		)
		return
	}

	const transport = getSmtpTransport()

	try {
		await transport.sendMail({
			from: process.env.EMAIL_FROM,
			to: email,
			subject: "Your Bunsho Builder password reset code",
			text: [
				"Use this code to reset your password:",
				"",
				code,
				"",
				"This code expires in 10 minutes. If you did not request it, you can ignore this email.",
			].join("\n"),
		})
	} catch (error) {
		throw createSmtpSendError(error)
	}
}
