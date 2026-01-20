/**
 * Geodesic median calculation using Weiszfeld's algorithm adapted for spherical coordinates.
 * Finds the point that minimizes total travel distance to all given points.
 */

export interface GeoPoint {
	lat: number;
	lng: number;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
	return radians * (180 / Math.PI);
}

/**
 * Calculate the haversine distance between two points in kilometers
 */
export function haversineDistance(p1: GeoPoint, p2: GeoPoint): number {
	const lat1 = toRadians(p1.lat);
	const lat2 = toRadians(p2.lat);
	const dLat = toRadians(p2.lat - p1.lat);
	const dLng = toRadians(p2.lng - p1.lng);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return EARTH_RADIUS_KM * c;
}

/**
 * Calculate total distance from a point to all other points
 */
export function totalDistance(center: GeoPoint, points: GeoPoint[]): number {
	return points.reduce((sum, p) => sum + haversineDistance(center, p), 0);
}

/**
 * Calculate the centroid (geographic center) of a set of points
 */
function centroid(points: GeoPoint[]): GeoPoint {
	if (points.length === 0) {
		return { lat: 0, lng: 0 };
	}

	// Convert to Cartesian, average, convert back
	let x = 0,
		y = 0,
		z = 0;

	for (const p of points) {
		const lat = toRadians(p.lat);
		const lng = toRadians(p.lng);
		x += Math.cos(lat) * Math.cos(lng);
		y += Math.cos(lat) * Math.sin(lng);
		z += Math.sin(lat);
	}

	x /= points.length;
	y /= points.length;
	z /= points.length;

	const lng = Math.atan2(y, x);
	const hyp = Math.sqrt(x * x + y * y);
	const lat = Math.atan2(z, hyp);

	return {
		lat: toDegrees(lat),
		lng: toDegrees(lng)
	};
}

/**
 * Calculate the geodesic median (geometric median on a sphere)
 * using Weiszfeld's algorithm. This minimizes total travel distance.
 *
 * @param points - Array of geographic points
 * @param maxIterations - Maximum iterations for convergence (default: 100)
 * @param tolerance - Convergence tolerance in km (default: 0.001)
 * @returns The geodesic median point, or null if no valid points
 */
export function geodesicMedian(
	points: GeoPoint[],
	maxIterations = 100,
	tolerance = 0.001
): GeoPoint | null {
	const validPoints = points.filter(
		(p) => p.lat != null && p.lng != null && !isNaN(p.lat) && !isNaN(p.lng)
	);

	if (validPoints.length === 0) {
		return null;
	}

	if (validPoints.length === 1) {
		return validPoints[0];
	}

	// Start with centroid as initial estimate
	let estimate = centroid(validPoints);

	for (let i = 0; i < maxIterations; i++) {
		let sumWeightedLat = 0;
		let sumWeightedLng = 0;
		let sumWeights = 0;

		for (const p of validPoints) {
			const dist = haversineDistance(estimate, p);

			// Avoid division by zero - if point is very close, skip it
			if (dist < 0.0001) {
				continue;
			}

			const weight = 1 / dist;
			sumWeightedLat += weight * p.lat;
			sumWeightedLng += weight * p.lng;
			sumWeights += weight;
		}

		if (sumWeights === 0) {
			// All points are at the same location as estimate
			break;
		}

		const newEstimate: GeoPoint = {
			lat: sumWeightedLat / sumWeights,
			lng: sumWeightedLng / sumWeights
		};

		// Check convergence
		const movement = haversineDistance(estimate, newEstimate);
		estimate = newEstimate;

		if (movement < tolerance) {
			break;
		}
	}

	return estimate;
}

export interface MeetingPointResult {
	point: GeoPoint;
	totalDistanceKm: number;
	averageDistanceKm: number;
	nodeCount: number;
}

/**
 * Calculate the best meeting point for a set of nodes
 */
export function calculateBestMeetingPoint(points: GeoPoint[]): MeetingPointResult | null {
	const median = geodesicMedian(points);

	if (!median) {
		return null;
	}

	const total = totalDistance(median, points);

	return {
		point: median,
		totalDistanceKm: Math.round(total * 10) / 10,
		averageDistanceKm: Math.round((total / points.length) * 10) / 10,
		nodeCount: points.length
	};
}
