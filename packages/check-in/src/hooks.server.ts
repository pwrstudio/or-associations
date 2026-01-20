import type { Handle } from '@sveltejs/kit';
import { verifySessionToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');

	if (sessionToken) {
		const session = await verifySessionToken(sessionToken);
		if (session) {
			event.locals.authHash = session.authHash;
			event.locals.anonymousId = session.anonymousId;
		} else {
			event.locals.authHash = null;
			event.locals.anonymousId = null;
		}
	} else {
		event.locals.authHash = null;
		event.locals.anonymousId = null;
	}

	return resolve(event);
};
