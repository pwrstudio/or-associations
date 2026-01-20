import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET } from '$env/static/private';

const secret = new TextEncoder().encode(JWT_SECRET);

const SESSION_EXPIRY = '30d';

export interface SessionPayload {
	authHash: string;
	anonymousId: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
	return new SignJWT({ ...payload, type: 'session' })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(SESSION_EXPIRY)
		.sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(token, secret);
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
