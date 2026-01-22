import type { ForceFunction, SimulationState, Vec2, ForceNode } from './types';
import { createNoise2D } from './noise';

/**
 * Center force - pulls nodes toward a center point
 */
export function createCenterForce(cx: number, cy: number, strength: number = 0.1): ForceFunction {
	return (state: SimulationState, alpha: number) => {
		const deltas = new Map<string, Vec2>();

		state.nodes.forEach((node, id) => {
			deltas.set(id, {
				x: (cx - node.x) * strength * alpha,
				y: (cy - node.y) * strength * alpha
			});
		});

		return deltas;
	};
}

/**
 * Many-body force - nodes repel each other
 */
export function createManyBodyForce(
	strength: number = -30,
	distanceMin: number = 1,
	distanceMax: number = Infinity
): ForceFunction {
	return (state: SimulationState, alpha: number) => {
		const deltas = new Map<string, Vec2>();
		const nodes = Array.from(state.nodes.values());

		nodes.forEach((n) => deltas.set(n.id, { x: 0, y: 0 }));

		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const a = nodes[i];
				const b = nodes[j];

				let dx = b.x - a.x;
				let dy = b.y - a.y;
				let dist = Math.sqrt(dx * dx + dy * dy);

				if (dist < distanceMin) dist = distanceMin;
				if (dist > distanceMax) continue;

				// Force magnitude (inverse square)
				const forceMag = (strength * alpha) / (dist * dist);

				// Normalize direction
				dx /= dist;
				dy /= dist;

				// Apply force (Newton's third law)
				const forceA = forceMag / a.mass;
				const forceB = forceMag / b.mass;

				const deltaA = deltas.get(a.id)!;
				const deltaB = deltas.get(b.id)!;

				deltas.set(a.id, {
					x: deltaA.x - dx * forceB,
					y: deltaA.y - dy * forceB
				});
				deltas.set(b.id, {
					x: deltaB.x + dx * forceA,
					y: deltaB.y + dy * forceA
				});
			}
		}

		return deltas;
	};
}

/**
 * Link force - spring force along edges
 */
export function createLinkForce(distance: number = 100, strength: number = 1): ForceFunction {
	return (state: SimulationState, alpha: number) => {
		const deltas = new Map<string, Vec2>();

		state.nodes.forEach((_, id) => deltas.set(id, { x: 0, y: 0 }));

		state.edges.forEach((edge) => {
			const source = state.nodes.get(edge.source);
			const target = state.nodes.get(edge.target);
			if (!source || !target) return;

			let dx = target.x - source.x;
			let dy = target.y - source.y;
			const dist = Math.sqrt(dx * dx + dy * dy) || 1;

			// Spring force
			const displacement = dist - distance;
			const force = (displacement * strength * edge.strength * alpha) / dist;

			dx *= force;
			dy *= force;

			// Distribute based on mass
			const totalMass = source.mass + target.mass;
			const sourceRatio = target.mass / totalMass;
			const targetRatio = source.mass / totalMass;

			const sourceD = deltas.get(source.id)!;
			const targetD = deltas.get(target.id)!;

			deltas.set(source.id, {
				x: sourceD.x + dx * sourceRatio,
				y: sourceD.y + dy * sourceRatio
			});
			deltas.set(target.id, {
				x: targetD.x - dx * targetRatio,
				y: targetD.y - dy * targetRatio
			});
		});

		return deltas;
	};
}

/**
 * Collision force - prevents node overlap
 * Fixed nodes don't move; the other node receives the full push
 */
export function createCollisionForce(
	radiusAccessor: (node: ForceNode) => number = (n) => n.radius,
	strength: number = 1,
	padding: number = 2
): ForceFunction {
	return (state: SimulationState, alpha: number) => {
		const deltas = new Map<string, Vec2>();
		const nodes = Array.from(state.nodes.values());

		nodes.forEach((n) => deltas.set(n.id, { x: 0, y: 0 }));

		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const a = nodes[i];
				const b = nodes[j];

				const dx = b.x - a.x;
				const dy = b.y - a.y;
				const dist = Math.sqrt(dx * dx + dy * dy) || 1;

				const minDist = radiusAccessor(a) + radiusAccessor(b) + padding;

				if (dist < minDist) {
					const overlap = ((minDist - dist) / dist) * strength * alpha;

					const ax = dx * overlap;
					const ay = dy * overlap;

					const deltaA = deltas.get(a.id)!;
					const deltaB = deltas.get(b.id)!;

					// If one node is fixed, the other receives full push
					if (a.fixed && !b.fixed) {
						deltas.set(b.id, { x: deltaB.x + ax, y: deltaB.y + ay });
					} else if (b.fixed && !a.fixed) {
						deltas.set(a.id, { x: deltaA.x - ax, y: deltaA.y - ay });
					} else if (!a.fixed && !b.fixed) {
						// Both movable: split the push
						deltas.set(a.id, { x: deltaA.x - ax * 0.5, y: deltaA.y - ay * 0.5 });
						deltas.set(b.id, { x: deltaB.x + ax * 0.5, y: deltaB.y + ay * 0.5 });
					}
					// If both fixed, neither moves
				}
			}
		}

		return deltas;
	};
}

/**
 * Radial force from center - keeps nodes at minimum distance from a point
 */
export function createRadialMinDistanceForce(
	cx: number,
	cy: number,
	minDistance: number,
	strength: number = 1
): ForceFunction {
	return (state: SimulationState, alpha: number) => {
		const deltas = new Map<string, Vec2>();

		state.nodes.forEach((node, id) => {
			if (node.fixed) {
				deltas.set(id, { x: 0, y: 0 });
				return;
			}

			const dx = node.x - cx;
			const dy = node.y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy) || 1;

			if (dist < minDistance) {
				// Push outward
				const push = ((minDistance - dist) / dist) * strength * alpha;
				deltas.set(id, { x: dx * push, y: dy * push });
			} else {
				deltas.set(id, { x: 0, y: 0 });
			}
		});

		return deltas;
	};
}

/**
 * Bounds force - keeps nodes within viewport
 */
export function createBoundsForce(padding: number = 20, strength: number = 1): ForceFunction {
	return (state: SimulationState, alpha: number) => {
		const deltas = new Map<string, Vec2>();
		const { width, height } = state.config;

		state.nodes.forEach((node, id) => {
			let dx = 0,
				dy = 0;
			const r = node.radius + padding;

			if (node.x < r) dx = (r - node.x) * strength;
			if (node.x > width - r) dx = (width - r - node.x) * strength;
			if (node.y < r) dy = (r - node.y) * strength;
			if (node.y > height - r) dy = (height - r - node.y) * strength;

			deltas.set(id, { x: dx * alpha, y: dy * alpha });
		});

		return deltas;
	};
}

/**
 * Idle movement force - Perlin noise for organic drift
 */
export function createIdleMovementForce(
	scale: number = 0.002,
	amplitude: number = 3,
	speed: number = 0.001
): ForceFunction {
	const noiseX = createNoise2D(12345);
	const noiseY = createNoise2D(67890);
	let time = 0;

	return (state: SimulationState) => {
		time += speed;
		const deltas = new Map<string, Vec2>();

		state.nodes.forEach((node, id) => {
			// Only apply to non-dragging, non-fixed nodes
			if (node.dragging || node.fixed) {
				deltas.set(id, { x: 0, y: 0 });
				return;
			}

			// Use node id hash for unique per-node offset
			const idHash = hashString(id);
			const nx = noiseX(idHash * 0.1 + time, time * 0.5);
			const ny = noiseY(time * 0.5, idHash * 0.1 + time);

			// Only apply when simulation is "settled" (low alpha)
			const idleAlpha = Math.max(0, 1 - state.config.alpha * 10);

			deltas.set(id, {
				x: nx * amplitude * idleAlpha,
				y: ny * amplitude * idleAlpha
			});
		});

		return deltas;
	};
}

/**
 * Simple string hash for consistent node-specific values
 */
function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash);
}
