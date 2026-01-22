import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { getLocationFromIp } from '$lib/server/geolocation';
import { upsertNode, getNode, type NodeData } from '$lib/server/sanity';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.authHash || !locals.anonymousId) {
		return { authenticated: false, lastCheckIn: null };
	}

	const lastCheckIn = await getNode(locals.anonymousId);

	return {
		authenticated: true,
		lastCheckIn
	};
};

export const actions: Actions = {
	checkin: async ({ locals, getClientAddress, request }) => {
		if (!locals.authHash || !locals.anonymousId) {
			throw redirect(302, '/login');
		}

		const ip = getClientAddress();
		const geo = await getLocationFromIp(ip);

		if (!geo) {
			return fail(400, { error: 'Could not determine your location' });
		}

		const nodeData: NodeData = {
			geopoint: {
				_type: 'geopoint',
				lat: geo.lat,
				lng: geo.lng
			},
			city: geo.city,
			region: geo.region,
			country: geo.country,
			timezone: geo.timezone,
			checkedInAt: new Date().toISOString()
		};

		try {
			await upsertNode(locals.anonymousId, nodeData);
		} catch (err) {
			console.error('Failed to save check-in:', err);
			return fail(500, { error: 'Failed to save check-in' });
		}

		return {
			success: true,
			location: {
				city: geo.city,
				country: geo.country,
				timezone: geo.timezone
			},
			checkedInAt: nodeData.checkedInAt
		};
	}
};
