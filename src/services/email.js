import { HttpError } from "../errors.js"

const zohoConfigKeys = [
	"ZOHO_CLIENT_ID",
	"ZOHO_CLIENT_SECRET",
	"ZOHO_REFRESH_TOKEN",
	"ZOHO_ACCOUNT_ID",
	"ZOHO_FROM_ADDRESS",
]
const defaultZohoAccountsUrl = "https://accounts.zoho.com.au"
const defaultZohoMailApiUrl = "https://mail.zoho.com.au"
const defaultZohoTimeoutMs = 10_000

function envValue(key) {
	return process.env[key]?.trim()
}

function getMissingZohoConfigKeys() {
	return zohoConfigKeys.filter((key) => !envValue(key))
}

function hasZohoConfig() {
	return getMissingZohoConfigKeys().length === 0
}

function getZohoAccountsUrl() {
	return (envValue("ZOHO_ACCOUNTS_URL") || defaultZohoAccountsUrl).replace(/\/+$/, "")
}

function getZohoMailApiUrl() {
	return (envValue("ZOHO_MAIL_API_URL") || defaultZohoMailApiUrl).replace(/\/+$/, "")
}

function getZohoTimeoutMs() {
	return Number(envValue("ZOHO_TIMEOUT_MS") || defaultZohoTimeoutMs)
}

function createZohoConfigError() {
	return new HttpError(500, "Password reset email is not configured.", {
		code: "PASSWORD_RESET_EMAIL_NOT_CONFIGURED",
		logMessage: `Zoho password reset email is not configured. Missing env vars: ${getMissingZohoConfigKeys().join(", ")}`,
	})
}

function getZohoErrorMessage(data) {
	if (!data || typeof data !== "object") return ""

	return [
		data.error,
		data.error_description,
		data.message,
		data.status?.description,
		data.data?.errorCode,
		data.data?.moreInfo,
	]
		.filter(Boolean)
		.join(" ")
}

function createZohoResponseError(operation, response, data) {
	const zohoMessage = getZohoErrorMessage(data)
	const responseDetails = [response.status, response.statusText, zohoMessage]
		.filter(Boolean)
		.join(" ")

	return new HttpError(502, "Password reset email could not be sent.", {
		code: "PASSWORD_RESET_EMAIL_SEND_FAILED",
		logMessage: `Zoho Mail API failed while trying to ${operation}${responseDetails ? ` (${responseDetails})` : ""}.`,
	})
}

function createZohoNetworkError(operation, error) {
	return new HttpError(502, "Password reset email could not be sent.", {
		code: "PASSWORD_RESET_EMAIL_SEND_FAILED",
		cause: error,
		logMessage: `Zoho Mail API request failed while trying to ${operation}.`,
	})
}

async function fetchWithTimeout(url, options = {}) {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), getZohoTimeoutMs())

	try {
		return await fetch(url, {
			...options,
			signal: controller.signal,
		})
	} finally {
		clearTimeout(timer)
	}
}

async function readResponseData(response) {
	try {
		return await response.json()
	} catch {
		return null
	}
}

async function refreshZohoAccessToken() {
	const params = new URLSearchParams({
		refresh_token: envValue("ZOHO_REFRESH_TOKEN"),
		client_id: envValue("ZOHO_CLIENT_ID"),
		client_secret: envValue("ZOHO_CLIENT_SECRET"),
		grant_type: "refresh_token",
	})
	const tokenUrl = `${getZohoAccountsUrl()}/oauth/v2/token`

	let response

	try {
		response = await fetchWithTimeout(tokenUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params,
		})
	} catch (error) {
		throw createZohoNetworkError("refresh the access token", error)
	}

	const data = await readResponseData(response)

	if (!response.ok || !data?.access_token) {
		throw createZohoResponseError("refresh the access token", response, data)
	}

	return data.access_token
}

async function sendZohoMail({ toAddress, subject, content }) {
	const accessToken = await refreshZohoAccessToken()
	const accountId = encodeURIComponent(envValue("ZOHO_ACCOUNT_ID"))
	const sendUrl = `${getZohoMailApiUrl()}/api/accounts/${accountId}/messages`

	let response

	try {
		response = await fetchWithTimeout(sendUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: `Zoho-oauthtoken ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				fromAddress: envValue("ZOHO_FROM_ADDRESS"),
				toAddress,
				subject,
				content,
				mailFormat: "plaintext",
				askReceipt: "no",
				encoding: "UTF-8",
			}),
		})
	} catch (error) {
		throw createZohoNetworkError("send the password reset email", error)
	}

	const data = await readResponseData(response)

	if (!response.ok) {
		throw createZohoResponseError("send the password reset email", response, data)
	}
}

export async function sendPasswordResetCode({ email, code }) {
	if (!hasZohoConfig()) {
		if (process.env.NODE_ENV === "production") {
			throw createZohoConfigError()
		}

		console.info(
			`Password reset code for ${email}: ${code}. Zoho email is not configured; missing env vars: ${getMissingZohoConfigKeys().join(", ")}`,
		)
		return
	}

	await sendZohoMail({
		toAddress: email,
		subject: "Your Bunsho Builder password reset code",
		content: [
			"Use this code to reset your password:",
			"",
			code,
			"",
			"This code expires in 10 minutes. If you did not request it, you can ignore this email.",
		].join("\n"),
	})
}
