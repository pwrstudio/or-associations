import type { Vec2, EdgePoint, BezierCurve, ForceNode } from './types';

/**
 * Calculate the point on a circle's edge toward a target point
 */
export function getCircleEdgePoint(
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
 * Calculate edge-to-edge line endpoints between two nodes
 */
export function getEdgeToEdgePoints(
	source: ForceNode,
	target: ForceNode
): { start: EdgePoint; end: EdgePoint } {
	const start = getCircleEdgePoint(source.x, source.y, source.radius, target.x, target.y);

	const end = getCircleEdgePoint(target.x, target.y, target.radius, source.x, source.y);

	return { start, end };
}

/**
 * Generate a smooth bezier curve between two edge points
 */
export function generateBezierCurve(
	start: EdgePoint,
	end: EdgePoint,
	curvature: number = 0.3
): BezierCurve {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const dist = Math.sqrt(dx * dx + dy * dy);

	// Control point distance from endpoints
	const cpDist = dist * curvature;

	return {
		start: { x: start.x, y: start.y },
		cp1: {
			x: start.x + Math.cos(start.angle) * cpDist,
			y: start.y + Math.sin(start.angle) * cpDist
		},
		cp2: {
			x: end.x + Math.cos(end.angle) * cpDist,
			y: end.y + Math.sin(end.angle) * cpDist
		},
		end: { x: end.x, y: end.y }
	};
}

/**
 * Convert bezier curve to SVG path data
 */
export function bezierToSVGPath(curve: BezierCurve): string {
	return `M ${curve.start.x} ${curve.start.y} C ${curve.cp1.x} ${curve.cp1.y}, ${curve.cp2.x} ${curve.cp2.y}, ${curve.end.x} ${curve.end.y}`;
}

/**
 * Get point along a bezier curve at parameter t (0-1)
 */
export function getPointOnBezier(curve: BezierCurve, t: number): Vec2 {
	const t2 = t * t;
	const t3 = t2 * t;
	const mt = 1 - t;
	const mt2 = mt * mt;
	const mt3 = mt2 * mt;

	return {
		x:
			mt3 * curve.start.x +
			3 * mt2 * t * curve.cp1.x +
			3 * mt * t2 * curve.cp2.x +
			t3 * curve.end.x,
		y:
			mt3 * curve.start.y + 3 * mt2 * t * curve.cp1.y + 3 * mt * t2 * curve.cp2.y + t3 * curve.end.y
	};
}

/**
 * Calculate approximate length of a bezier curve
 */
export function getBezierLength(curve: BezierCurve, segments: number = 20): number {
	let length = 0;
	let prev = curve.start;

	for (let i = 1; i <= segments; i++) {
		const point = getPointOnBezier(curve, i / segments);
		const dx = point.x - prev.x;
		const dy = point.y - prev.y;
		length += Math.sqrt(dx * dx + dy * dy);
		prev = point;
	}

	return length;
}

/**
 * Calculate distance between two points
 */
export function distance(a: Vec2, b: Vec2): number {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	return Math.sqrt(dx * dx + dy * dy);
}
