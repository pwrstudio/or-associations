import { SignJWT, jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';

const SESSION_EXPIRY = '30d';

export interface SessionPayload {
	authHash: string;
	anonymousId: string;
}

function getSecret() {
	return new TextEncoder().encode(env.JWT_SECRET);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
	return new SignJWT({ ...payload, type: 'session' })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(SESSION_EXPIRY)
		.sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(token, getSecret());
		if (
			payload.type !== 'session' ||
			typeof payload.authHash !== 'string' ||
			typeof payload.anonymousId !== 'string'
		) {
			return null;
		}
		return {
			authHash: payload.authHash,
			anonymousId: payload.anonymousId
		};
	} catch {
		return null;
	}
}
