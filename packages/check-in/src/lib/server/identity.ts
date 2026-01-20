import { createHmac } from 'crypto';
import { AUTH_SALT, ANONYMOUS_SALT } from '$env/static/private';

/**
 * Creates an auth hash for session/authentication.
 * Used to identify the member in the Settings document.
 */
export function createAuthHash(email: string): string {
	return createHmac('sha256', AUTH_SALT).update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Creates an anonymous ID for check-in data.
 * Uses a different salt so it cannot be correlated with the auth hash.
 * This ensures check-in location data remains anonymous.
 */
export function createAnonymousId(email: string): string {
	return createHmac('sha256', ANONYMOUS_SALT).update(email.toLowerCase().trim()).digest('hex');
}
