import type { ForceFunction, ForceNode, ForceEdge } from './types';

/**
 * Center force - pulls nodes toward a center point
 * Directly mutates node velocities for performance
 */
export function createCenterForce(cx: number, cy: number, strength: number = 0.1): ForceFunction {
	return (nodes: ForceNode[], _edges: ForceEdge[], alpha: number) => {
		const k = strength * alpha;
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.fixed || node.dragging) continue;
			node.vx += (cx - node.x) * k;
			node.vy += (cy - node.y) * k;
		}
	};
}

/**
 * Many-body force - nodes repel each other
 * O(n²) but acceptable for small node counts (<20)
 */
export function createManyBodyForce(
	strength: number = -30,
	distanceMin: number = 1,
	distanceMax: number = Infinity
): ForceFunction {
	const distanceMin2 = distanceMin * distanceMin;
	const distanceMax2 = distanceMax * distanceMax;

	return (nodes: ForceNode[], _edges: ForceEdge[], alpha: number) => {
		const n = nodes.length;

		for (let i = 0; i < n; i++) {
			const a = nodes[i];
			// Skip if fixed OR dragging (was incorrectly && before)
			if (a.fixed || a.dragging) continue;

			for (let j = i + 1; j < n; j++) {
				const b = nodes[j];

				const dx = b.x - a.x;
				const dy = b.y - a.y;
				let dist2 = dx * dx + dy * dy;

				// Skip if too far
				if (dist2 > distanceMax2) continue;

				// Clamp minimum distance to avoid singularities
				if (dist2 < distanceMin2) dist2 = distanceMin2;

				// Force magnitude (inverse square law)
				const forceMag = (strength * alpha) / dist2;

				// Normalize using sqrt only once
				const dist = Math.sqrt(dist2);
				const nx = dx / dist;
				const ny = dy / dist;

				// Apply force (Newton's third law)
				const forceA = forceMag / a.mass;
				const forceB = forceMag / b.mass;

				// a is guaranteed movable (checked above)
				a.vx -= nx * forceB;
				a.vy -= ny * forceB;

				if (!b.fixed && !b.dragging) {
					b.vx += nx * forceA;
					b.vy += ny * forceA;
				}
			}
		}
	};
}

/**
 * Link force - spring force along edges
 * Caches node map in closure, rebuilds only when node count changes
 */
export function createLinkForce(distance: number = 100, strength: number = 1): ForceFunction {
	let cachedNodeMap: Map<string, ForceNode> | null = null;
	let cachedNodeCount = -1;

	return (nodes: ForceNode[], edges: ForceEdge[], alpha: number) => {
		// Rebuild map only if node count changed
		if (cachedNodeCount !== nodes.length) {
			cachedNodeMap = new Map<string, ForceNode>();
			for (let i = 0; i < nodes.length; i++) {
				cachedNodeMap.set(nodes[i].id, nodes[i]);
			}
			cachedNodeCount = nodes.length;
		}

		const nodeMap = cachedNodeMap!;

		for (let i = 0; i < edges.length; i++) {
			const edge = edges[i];
			const source = nodeMap.get(edge.source);
			const target = nodeMap.get(edge.target);
			if (!source || !target) continue;

			const dx = target.x - source.x;
			const dy = target.y - source.y;
			const dist = Math.sqrt(dx * dx + dy * dy) || 1;

			// Spring force
			const displacement = dist - distance;
			const force = (displacement * strength * edge.strength * alpha) / dist;

			const fx = dx * force;
			const fy = dy * force;

			// Distribute based on mass
			const totalMass = source.mass + target.mass;
			const sourceRatio = target.mass / totalMass;
			const targetRatio = source.mass / totalMass;

			if (!source.fixed && !source.dragging) {
				source.vx += fx * sourceRatio;
				source.vy += fy * sourceRatio;
			}
			if (!target.fixed && !target.dragging) {
				target.vx -= fx * targetRatio;
				target.vy -= fy * targetRatio;
			}
		}
	};
}

/**
 * Collision force - prevents node overlap
 * Pre-computes radii to avoid O(n²) accessor calls
 * Uses squared distance comparison before sqrt
 */
export function createCollisionForce(
	radiusAccessor: (node: ForceNode) => number = (n) => n.radius,
	strength: number = 1,
	padding: number = 2
): ForceFunction {
	// Reusable array for radii (avoids allocation per frame)
	let radii: number[] = [];

	return (nodes: ForceNode[], _edges: ForceEdge[], alpha: number) => {
		const n = nodes.length;

		// Pre-compute all radii O(n) instead of O(n²) accessor calls
		if (radii.length !== n) {
			radii = new Array(n);
		}
		for (let i = 0; i < n; i++) {
			radii[i] = radiusAccessor(nodes[i]) + padding;
		}

		for (let i = 0; i < n; i++) {
			const a = nodes[i];
			const radiusA = radii[i];

			for (let j = i + 1; j < n; j++) {
				const b = nodes[j];
				const radiusB = radii[j];

				const dx = b.x - a.x;
				const dy = b.y - a.y;
				const dist2 = dx * dx + dy * dy;

				const minDist = radiusA + radiusB;
				const minDist2 = minDist * minDist;

				// Use squared comparison to avoid sqrt when not colliding
				if (dist2 < minDist2 && dist2 > 0) {
					const dist = Math.sqrt(dist2);
					const overlap = ((minDist - dist) / dist) * strength * alpha;
					const ax = dx * overlap;
					const ay = dy * overlap;

					// If one node is fixed, the other receives full push
					const aMovable = !a.fixed && !a.dragging;
					const bMovable = !b.fixed && !b.dragging;

					if (aMovable && bMovable) {
						// Both movable: split the push
						a.vx -= ax * 0.5;
						a.vy -= ay * 0.5;
						b.vx += ax * 0.5;
						b.vy += ay * 0.5;
					} else if (bMovable) {
						b.vx += ax;
						b.vy += ay;
					} else if (aMovable) {
						a.vx -= ax;
						a.vy -= ay;
					}
				}
			}
		}
	};
}

/**
 * Radial force - keeps nodes at minimum distance from a point
 */
export function createRadialMinDistanceForce(
	cx: number,
	cy: number,
	minDistance: number,
	strength: number = 1
): ForceFunction {
	const minDist2 = minDistance * minDistance;

	return (nodes: ForceNode[], _edges: ForceEdge[], alpha: number) => {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.fixed || node.dragging) continue;

			const dx = node.x - cx;
			const dy = node.y - cy;
			const dist2 = dx * dx + dy * dy;

			// Use squared comparison first
			if (dist2 < minDist2 && dist2 > 0) {
				const dist = Math.sqrt(dist2);
				const push = ((minDistance - dist) / dist) * strength * alpha;
				node.vx += dx * push;
				node.vy += dy * push;
			}
		}
	};
}

/**
 * Bounds force - keeps nodes within viewport
 */
export function createBoundsForce(
	width: number,
	height: number,
	padding: number = 20,
	strength: number = 1
): ForceFunction {
	return (nodes: ForceNode[], _edges: ForceEdge[], alpha: number) => {
		const k = strength * alpha;
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.fixed || node.dragging) continue;

			const r = node.radius + padding;

			if (node.x < r) node.vx += (r - node.x) * k;
			else if (node.x > width - r) node.vx += (width - r - node.x) * k;

			if (node.y < r) node.vy += (r - node.y) * k;
			else if (node.y > height - r) node.vy += (height - r - node.y) * k;
		}
	};
}
