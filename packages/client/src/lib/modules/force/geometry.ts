import type { ForceNode } from './types';

// Threshold for geometry cache invalidation (pixels)
export const GEOMETRY_THRESHOLD = 0.5;

interface EdgePoint {
	x: number;
	y: number;
	angle: number;
}

interface BezierCurve {
	startX: number;
	startY: number;
	cp1X: number;
	cp1Y: number;
	cp2X: number;
	cp2Y: number;
	endX: number;
	endY: number;
}

/**
 * Calculate the point on a circle's edge toward a target point
 */
function getCircleEdgePoint(
	cx: number,
	cy: number,
	radius: number,
	targetX: number,
	targetY: number
): EdgePoint {
	const dx = targetX - cx;
	const dy = targetY - cy;
	const angle = Math.atan2(dy, dx);

	return {
		x: cx + Math.cos(angle) * radius,
		y: cy + Math.sin(angle) * radius,
		angle
	};
}

/**
 * Compute edge geometry for rendering
 * Returns path string and approximate length
 */
export function computeEdgeGeometry(
	source: ForceNode,
	target: ForceNode,
	curvature: number = 0.3
): { path: string; length: number } {
	// Get edge points on circle boundaries
	const start = getCircleEdgePoint(source.x, source.y, source.radius, target.x, target.y);
	const end = getCircleEdgePoint(target.x, target.y, target.radius, source.x, source.y);

	// Generate bezier curve
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const dist = Math.sqrt(dx * dx + dy * dy);

	// Control point distance from endpoints
	const cpDist = dist * curvature;

	const curve: BezierCurve = {
		startX: start.x,
		startY: start.y,
		cp1X: start.x + Math.cos(start.angle) * cpDist,
		cp1Y: start.y + Math.sin(start.angle) * cpDist,
		cp2X: end.x + Math.cos(end.angle) * cpDist,
		cp2Y: end.y + Math.sin(end.angle) * cpDist,
		endX: end.x,
		endY: end.y
	};

	// Generate SVG path
	const path = `M ${curve.startX} ${curve.startY} C ${curve.cp1X} ${curve.cp1Y}, ${curve.cp2X} ${curve.cp2Y}, ${curve.endX} ${curve.endY}`;

	// Approximate bezier length using fewer segments (10 instead of 20)
	// This is the main optimization - reduces sqrt calls significantly
	const length = approximateBezierLength(curve, 10);

	return { path, length };
}

/**
 * Approximate bezier curve length using line segments
 * Uses fewer segments than before for better performance
 */
function approximateBezierLength(curve: BezierCurve, segments: number): number {
	let length = 0;
	let prevX = curve.startX;
	let prevY = curve.startY;

	for (let i = 1; i <= segments; i++) {
		const t = i / segments;
		const point = getPointOnBezier(curve, t);
		const dx = point.x - prevX;
		const dy = point.y - prevY;
		length += Math.sqrt(dx * dx + dy * dy);
		prevX = point.x;
		prevY = point.y;
	}

	return length;
}

/**
 * Get point along a bezier curve at parameter t (0-1)
 */
function getPointOnBezier(curve: BezierCurve, t: number): { x: number; y: number } {
	const t2 = t * t;
	const t3 = t2 * t;
	const mt = 1 - t;
	const mt2 = mt * mt;
	const mt3 = mt2 * mt;

	return {
		x: mt3 * curve.startX + 3 * mt2 * t * curve.cp1X + 3 * mt * t2 * curve.cp2X + t3 * curve.endX,
		y: mt3 * curve.startY + 3 * mt2 * t * curve.cp1Y + 3 * mt * t2 * curve.cp2Y + t3 * curve.endY
	};
}
