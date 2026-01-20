import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createSessionToken } from '$lib/server/auth';
import { createAuthHash, createAnonymousId } from '$lib/server/identity';
import { isEmailAllowed, getAuthHashForEmail, registerAuthHash } from '$lib/server/sanity';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.authHash) {
		throw redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Please enter a valid email address', email });
		}

		const allowed = await isEmailAllowed(email);
		if (!allowed) {
			return fail(403, {
				error:
					'This email is not authorized. Please contact an administrator if you believe this is an error.',
				email
			});
		}

		const authHash = createAuthHash(email);
		const anonymousId = createAnonymousId(email);

		// Check if already registered, if not register them (only authHash in Settings)
		const existingHash = await getAuthHashForEmail(email);
		if (!existingHash) {
			try {
				await registerAuthHash(email, authHash);
			} catch (err) {
				console.error('Failed to register member:', err);
				return fail(500, {
					error: 'Something went wrong. Please try again later.',
					email
				});
			}
		}

		// Create session with both hashes (anonymousId only exists in session, not in DB)
		const sessionToken = await createSessionToken({ authHash, anonymousId });

		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		throw redirect(302, '/');
	}
};
