import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createSessionToken } from '$lib/server/auth';
import { createAuthHash, createAnonymousId } from '$lib/server/identity';
import { isEmailAllowed, isRegistered, verifyPassword, registerPassword } from '$lib/server/sanity';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.authHash) {
		throw redirect(302, '/');
	}
};

export const actions: Actions = {
	signin: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Please enter a valid email address', email });
		}

		if (!password) {
			return fail(400, { error: 'Please enter your password', email });
		}

		const allowed = await isEmailAllowed(email);
		if (!allowed) {
			return fail(403, {
				error: 'This email is not authorized.',
				email
			});
		}

		const registered = await isRegistered(email);
		if (!registered) {
			return fail(400, {
				error: 'No account found. Please sign up first.',
				email
			});
		}

		const valid = await verifyPassword(email, password);
		if (!valid) {
			return fail(401, {
				error: 'Invalid password.',
				email
			});
		}

		const authHash = createAuthHash(email);
		const anonymousId = createAnonymousId(email);
		const sessionToken = await createSessionToken({ authHash, anonymousId });

		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		throw redirect(302, '/');
	},

	signup: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Please enter a valid email address', email });
		}

		if (!password) {
			return fail(400, { error: 'Please enter a password', email });
		}

		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters', email });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match', email });
		}

		const allowed = await isEmailAllowed(email);
		if (!allowed) {
			return fail(403, {
				error: 'This email is not authorized. Please contact an administrator.',
				email
			});
		}

		const alreadyRegistered = await isRegistered(email);
		if (alreadyRegistered) {
			return fail(400, {
				error: 'An account already exists for this email. Please sign in.',
				email
			});
		}

		try {
			await registerPassword(email, password);
		} catch (err) {
			console.error('Failed to register:', err);
			return fail(500, {
				error: 'Something went wrong. Please try again later.',
				email
			});
		}

		const authHash = createAuthHash(email);
		const anonymousId = createAnonymousId(email);
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
