import { loadData } from '$lib/modules/sanity';
import { nodesQuery } from '$lib/groq';
import type { NodeData } from '$lib/types';
import { calculateBestMeetingPoint, type GeoPoint } from '$lib/modules/geodesic';

export async function load() {
	const nodes = await loadData<NodeData[]>(nodesQuery);

	const points: GeoPoint[] = nodes
		.filter((n) => n.geopoint?.lat != null && n.geopoint?.lng != null)
		.map((n) => ({
			lat: n.geopoint!.lat!,
			lng: n.geopoint!.lng!
		}));

	const meetingPoint = calculateBestMeetingPoint(points);

	return {
		nodes,
		meetingPoint
	};
}
