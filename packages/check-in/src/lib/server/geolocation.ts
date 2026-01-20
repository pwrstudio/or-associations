import geoip from 'fast-geoip';

export interface GeoLocation {
	lat: number;
	lng: number;
	city?: string;
	region?: string;
	country?: string;
	timezone?: string;
}

const LOCALHOST_IPS = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

export async function getLocationFromIp(ip: string): Promise<GeoLocation | null> {
	// In development, localhost can't be geolocated - return a default location
	if (LOCALHOST_IPS.includes(ip)) {
		return {
			lat: 59.3293,
			lng: 18.0686,
			city: 'Stockholm',
			country: 'SE',
			timezone: 'Europe/Stockholm'
		};
	}

	try {
		const geo = await geoip.lookup(ip);
		if (!geo || !geo.ll) {
			return null;
		}

		return {
			lat: geo.ll[0],
			lng: geo.ll[1],
			city: geo.city || undefined,
			region: geo.region || undefined,
			country: geo.country || undefined,
			timezone: geo.timezone || undefined
		};
	} catch {
		return null;
	}
}
