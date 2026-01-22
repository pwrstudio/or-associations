import { loadData } from '$lib/modules/sanity';
import { nodesQuery } from '$lib/groq';
import type { NodeData } from '$lib/types';
import { centroid, totalDistance, type GeoPoint } from '$lib/modules/geodesic';

export async function load() {
	const nodes = await loadData<NodeData[]>(nodesQuery);

	const points: GeoPoint[] = nodes
		.filter((n) => n.geopoint?.lat != null && n.geopoint?.lng != null)
		.map((n) => ({
			lat: n.geopoint!.lat!,
			lng: n.geopoint!.lng!
		}));

	let centroidResult = null;

	if (points.length > 0) {
		const centroidPoint = centroid(points);
		const centroidTotal = totalDistance(centroidPoint, points);
		centroidResult = {
			point: centroidPoint,
			totalDistanceKm: Math.round(centroidTotal * 10) / 10,
			averageDistanceKm: Math.round((centroidTotal / points.length) * 10) / 10
		};
	}

	return {
		nodes,
		centroid: centroidResult
	};
}
