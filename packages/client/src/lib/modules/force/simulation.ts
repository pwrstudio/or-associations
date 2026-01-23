import type {
	ForceNode,
	ForceEdge,
	ForceNodeInput,
	SimulationConfig,
	RenderState,
	EdgeRenderState,
	EdgeAnimation,
	EasingFunction,
	NodeArrays,
	EdgeArrays
} from './types';
import { NODE_FLAG_FIXED, NODE_FLAG_DRAGGING } from './types';
import { computeEdgeGeometry, GEOMETRY_THRESHOLD } from './geometry';

// Performance logging
export interface PerformanceMetrics {
	tickTime: number;
	forceTime: number;
	geometryTime: number;
	animationTime: number;
	totalTime: number;
	nodeCount: number;
	edgeCount: number;
	fps: number;
}

let debugEnabled = false;
let lastMetrics: PerformanceMetrics | null = null;
let frameCount = 0;
let lastFpsTime = 0;
let currentFps = 0;

export function enablePerformanceLogging(enabled: boolean = true) {
	debugEnabled = enabled;
	if (enabled) {
		console.log('[Force] Performance logging enabled (TypedArray mode)');
	}
}

export function getPerformanceMetrics(): PerformanceMetrics | null {
	return lastMetrics;
}

// Easing functions
export const easings = {
	linear: (t: number) => t,
	easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
	easeInCubic: (t: number) => t * t * t,
	easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
};

export interface ForceConfig {
	centerX: number;
	centerY: number;
	centerStrength: number;
	repelStrength: number;
	repelDistanceMin2: number;
	repelDistanceMax2: number;
	linkDistance: number;
	linkStrength: number;
	collisionStrength: number;
	collisionPadding: number;
	radialMinDistance: number;
	radialStrength: number;
}

export interface Simulation {
	getRenderState: () => RenderState;
	subscribe: (fn: (state: RenderState) => void) => () => void;
	addNode: (node: ForceNodeInput) => void;
	removeNode: (id: string) => void;
	getNode: (id: string) => ForceNode | undefined;
	addEdge: (edge: ForceEdge) => void;
	removeEdge: (id: string) => void;
	setForceConfig: (config: Partial<ForceConfig>) => void;
	start: () => void;
	stop: () => void;
	tick: () => void;
	reheat: (alpha?: number) => void;
	dragStart: (nodeId: string) => void;
	dragMove: (nodeId: string, x: number, y: number) => void;
	dragEnd: (nodeId: string) => void;
	animateEdge: (
		edgeId: string,
		options?: {
			duration?: number;
			direction?: 'draw' | 'retract';
			easing?: EasingFunction;
			delay?: number;
			onComplete?: () => void;
		}
	) => void;
	animateEdges: (
		edgeIds: string[],
		options?: {
			duration?: number;
			stagger?: number;
			direction?: 'draw' | 'retract';
			easing?: EasingFunction;
			onAllComplete?: () => void;
		}
	) => void;
	getEdgeProgress: (edgeId: string) => number;
	destroy: () => void;
}

const defaultConfig: SimulationConfig = {
	alpha: 1,
	alphaDecay: 0.0228,
	alphaMin: 0.001,
	alphaTarget: 0,
	velocityDecay: 0.3,
	width: 600,
	height: 600
};

// Initial capacity for TypedArrays
const INITIAL_CAPACITY = 32;

function createNodeArrays(capacity: number = INITIAL_CAPACITY): NodeArrays {
	return {
		x: new Float32Array(capacity),
		y: new Float32Array(capacity),
		vx: new Float32Array(capacity),
		vy: new Float32Array(capacity),
		radius: new Float32Array(capacity),
		mass: new Float32Array(capacity),
		flags: new Uint8Array(capacity),
		ids: [],
		data: [],
		count: 0,
		capacity
	};
}

function createEdgeArrays(capacity: number = INITIAL_CAPACITY): EdgeArrays {
	return {
		sourceIdx: new Uint16Array(capacity),
		targetIdx: new Uint16Array(capacity),
		strength: new Float32Array(capacity),
		ids: [],
		progress: new Float32Array(capacity),
		count: 0,
		capacity
	};
}

function growNodeArrays(nodes: NodeArrays): NodeArrays {
	const newCapacity = nodes.capacity * 2;
	const newNodes: NodeArrays = {
		x: new Float32Array(newCapacity),
		y: new Float32Array(newCapacity),
		vx: new Float32Array(newCapacity),
		vy: new Float32Array(newCapacity),
		radius: new Float32Array(newCapacity),
		mass: new Float32Array(newCapacity),
		flags: new Uint8Array(newCapacity),
		ids: nodes.ids,
		data: nodes.data,
		count: nodes.count,
		capacity: newCapacity
	};
	// Copy existing data
	newNodes.x.set(nodes.x);
	newNodes.y.set(nodes.y);
	newNodes.vx.set(nodes.vx);
	newNodes.vy.set(nodes.vy);
	newNodes.radius.set(nodes.radius);
	newNodes.mass.set(nodes.mass);
	newNodes.flags.set(nodes.flags);
	return newNodes;
}

function growEdgeArrays(edges: EdgeArrays): EdgeArrays {
	const newCapacity = edges.capacity * 2;
	const newEdges: EdgeArrays = {
		sourceIdx: new Uint16Array(newCapacity),
		targetIdx: new Uint16Array(newCapacity),
		strength: new Float32Array(newCapacity),
		ids: edges.ids,
		progress: new Float32Array(newCapacity),
		count: edges.count,
		capacity: newCapacity
	};
	newEdges.sourceIdx.set(edges.sourceIdx);
	newEdges.targetIdx.set(edges.targetIdx);
	newEdges.strength.set(edges.strength);
	newEdges.progress.set(edges.progress);
	return newEdges;
}

export function createSimulation(initialConfig: Partial<SimulationConfig> = {}): Simulation {
	const config: SimulationConfig = { ...defaultConfig, ...initialConfig };

	// Pre-computed constants
	const velocityRetention = 1 - config.velocityDecay;

	// TypedArray storage (Struct of Arrays)
	let nodes = createNodeArrays();
	let edges = createEdgeArrays();

	// ID to index mapping (still needed for external API)
	const nodeIdToIdx = new Map<string, number>();
	const edgeIdToIdx = new Map<string, number>();

	// Force configuration (combined forces)
	let forceConfig: ForceConfig = {
		centerX: config.width / 2,
		centerY: config.height / 2,
		centerStrength: 0.08,
		repelStrength: -100,
		repelDistanceMin2: 100, // 10^2
		repelDistanceMax2: 160000, // 400^2
		linkDistance: 180,
		linkStrength: 0.4,
		collisionStrength: 1.5,
		collisionPadding: 30,
		radialMinDistance: 145,
		radialStrength: 1.0
	};

	// Animation state
	const edgeAnimations = new Map<string, EdgeAnimation>();

	// Geometry cache
	const geometryCache = new Map<
		string,
		{
			geometry: ReturnType<typeof computeEdgeGeometry>;
			sourceX: number;
			sourceY: number;
			targetX: number;
			targetY: number;
		}
	>();

	// Reusable render state objects (avoid allocation per frame)
	let cachedNodes: ForceNode[] = [];
	let cachedEdgeStates: EdgeRenderState[] = [];

	// Simulation state
	let alpha = config.alpha;
	let running = false;
	let tickCount = 0;
	let rafId: number | null = null;

	// Dirty tracking
	let isDirty = true;
	let lastMaxMovement = 0;
	const MOVEMENT_THRESHOLD = 0.01; // Skip render if max movement below this

	// Subscribers
	const subscribers = new Set<(state: RenderState) => void>();

	/**
	 * Combined force pass - all forces in a single loop over nodes
	 * This is the HOT PATH - optimized for speed
	 */
	function applyAllForces(alpha: number): number {
		const n = nodes.count;
		const e = edges.count;

		const { x, y, vx, vy, radius, mass, flags } = nodes;
		const {
			centerX,
			centerY,
			centerStrength,
			repelStrength,
			repelDistanceMin2,
			repelDistanceMax2,
			collisionStrength,
			collisionPadding,
			radialMinDistance,
			radialStrength
		} = forceConfig;

		const radialMinDist2 = radialMinDistance * radialMinDistance;
		const centerK = centerStrength * alpha;
		let maxMovement = 0;

		// === PASS 1: Center force + Radial force (per-node) ===
		for (let i = 0; i < n; i++) {
			const f = flags[i];
			if (f & (NODE_FLAG_FIXED | NODE_FLAG_DRAGGING)) continue;

			// Center force
			vx[i] += (centerX - x[i]) * centerK;
			vy[i] += (centerY - y[i]) * centerK;

			// Radial min distance from center
			const rdx = x[i] - centerX;
			const rdy = y[i] - centerY;
			const rdist2 = rdx * rdx + rdy * rdy;

			if (rdist2 < radialMinDist2 && rdist2 > 0) {
				const rdist = Math.sqrt(rdist2);
				const push = ((radialMinDistance - rdist) / rdist) * radialStrength * alpha;
				vx[i] += rdx * push;
				vy[i] += rdy * push;
			}
		}

		// === PASS 2: Many-body repulsion + Collision (O(n²) but fast with TypedArrays) ===
		for (let i = 0; i < n; i++) {
			const fi = flags[i];
			const iMovable = !(fi & (NODE_FLAG_FIXED | NODE_FLAG_DRAGGING));
			const xi = x[i],
				yi = y[i];
			const ri = radius[i] + collisionPadding;
			const mi = mass[i];

			for (let j = i + 1; j < n; j++) {
				const dx = x[j] - xi;
				const dy = y[j] - yi;
				let dist2 = dx * dx + dy * dy;

				// Many-body repulsion
				if (dist2 < repelDistanceMax2) {
					if (dist2 < repelDistanceMin2) dist2 = repelDistanceMin2;

					const dist = Math.sqrt(dist2);
					const forceMag = (repelStrength * alpha) / dist2;
					const nx = dx / dist;
					const ny = dy / dist;

					const forceI = forceMag / mi;
					const forceJ = forceMag / mass[j];

					if (iMovable) {
						vx[i] -= nx * forceJ;
						vy[i] -= ny * forceJ;
					}

					const fj = flags[j];
					if (!(fj & (NODE_FLAG_FIXED | NODE_FLAG_DRAGGING))) {
						vx[j] += nx * forceI;
						vy[j] += ny * forceI;
					}
				}

				// Collision detection
				const rj = radius[j] + collisionPadding;
				const minDist = ri + rj;
				const minDist2 = minDist * minDist;

				if (dist2 < minDist2 && dist2 > 0) {
					const dist = Math.sqrt(dist2);
					const overlap = ((minDist - dist) / dist) * collisionStrength * alpha;
					const ax = dx * overlap;
					const ay = dy * overlap;

					const fj = flags[j];
					const jMovable = !(fj & (NODE_FLAG_FIXED | NODE_FLAG_DRAGGING));

					if (iMovable && jMovable) {
						vx[i] -= ax * 0.5;
						vy[i] -= ay * 0.5;
						vx[j] += ax * 0.5;
						vy[j] += ay * 0.5;
					} else if (jMovable) {
						vx[j] += ax;
						vy[j] += ay;
					} else if (iMovable) {
						vx[i] -= ax;
						vy[i] -= ay;
					}
				}
			}
		}

		// === PASS 3: Link forces ===
		const { sourceIdx, targetIdx, strength: edgeStrength } = edges;
		const { linkDistance, linkStrength } = forceConfig;

		for (let i = 0; i < e; i++) {
			const si = sourceIdx[i];
			const ti = targetIdx[i];

			const dx = x[ti] - x[si];
			const dy = y[ti] - y[si];
			const dist = Math.sqrt(dx * dx + dy * dy) || 1;

			const displacement = dist - linkDistance;
			const force = (displacement * linkStrength * edgeStrength[i] * alpha) / dist;

			const fx = dx * force;
			const fy = dy * force;

			const totalMass = mass[si] + mass[ti];
			const sourceRatio = mass[ti] / totalMass;
			const targetRatio = mass[si] / totalMass;

			const sf = flags[si];
			const tf = flags[ti];

			if (!(sf & (NODE_FLAG_FIXED | NODE_FLAG_DRAGGING))) {
				vx[si] += fx * sourceRatio;
				vy[si] += fy * sourceRatio;
			}
			if (!(tf & (NODE_FLAG_FIXED | NODE_FLAG_DRAGGING))) {
				vx[ti] -= fx * targetRatio;
				vy[ti] -= fy * targetRatio;
			}
		}

		// === PASS 4: Apply velocities and compute movement ===
		for (let i = 0; i < n; i++) {
			const f = flags[i];
			if (f & (NODE_FLAG_FIXED | NODE_FLAG_DRAGGING)) {
				vx[i] = 0;
				vy[i] = 0;
				continue;
			}

			vx[i] *= velocityRetention;
			vy[i] *= velocityRetention;

			const mvx = Math.abs(vx[i]);
			const mvy = Math.abs(vy[i]);
			if (mvx > maxMovement) maxMovement = mvx;
			if (mvy > maxMovement) maxMovement = mvy;

			x[i] += vx[i];
			y[i] += vy[i];
		}

		return maxMovement;
	}

	function computeRenderState(): RenderState {
		const now = performance.now();
		const n = nodes.count;
		const e = edges.count;

		// Ensure cached arrays are large enough
		while (cachedNodes.length < n) {
			cachedNodes.push({
				id: '',
				x: 0,
				y: 0,
				vx: 0,
				vy: 0,
				radius: 0,
				mass: 0,
				fixed: false,
				dragging: false,
				data: undefined
			});
		}
		while (cachedEdgeStates.length < e) {
			cachedEdgeStates.push({
				id: '',
				geometry: { sourceX: 0, sourceY: 0, targetX: 0, targetY: 0, path: '', length: 0 },
				progress: 0,
				dashArray: '',
				dashOffset: 0
			});
		}

		// Convert TypedArrays to objects for Svelte
		for (let i = 0; i < n; i++) {
			const node = cachedNodes[i];
			node.id = nodes.ids[i];
			node.x = nodes.x[i];
			node.y = nodes.y[i];
			node.vx = nodes.vx[i];
			node.vy = nodes.vy[i];
			node.radius = nodes.radius[i];
			node.mass = nodes.mass[i];
			node.fixed = !!(nodes.flags[i] & NODE_FLAG_FIXED);
			node.dragging = !!(nodes.flags[i] & NODE_FLAG_DRAGGING);
			node.data = nodes.data[i];
		}

		// Process edges
		let edgeStateIdx = 0;
		for (let i = 0; i < e; i++) {
			const si = edges.sourceIdx[i];
			const ti = edges.targetIdx[i];
			const edgeId = edges.ids[i];

			const sourceX = nodes.x[si];
			const sourceY = nodes.y[si];
			const targetX = nodes.x[ti];
			const targetY = nodes.y[ti];

			// Check geometry cache
			const cached = geometryCache.get(edgeId);
			let geometry: ReturnType<typeof computeEdgeGeometry>;

			if (
				cached &&
				Math.abs(cached.sourceX - sourceX) < GEOMETRY_THRESHOLD &&
				Math.abs(cached.sourceY - sourceY) < GEOMETRY_THRESHOLD &&
				Math.abs(cached.targetX - targetX) < GEOMETRY_THRESHOLD &&
				Math.abs(cached.targetY - targetY) < GEOMETRY_THRESHOLD
			) {
				geometry = cached.geometry;
			} else {
				// Create temporary node objects for geometry calculation
				const sourceNode = cachedNodes[si];
				const targetNode = cachedNodes[ti];
				geometry = computeEdgeGeometry(sourceNode, targetNode);
				geometryCache.set(edgeId, {
					geometry,
					sourceX,
					sourceY,
					targetX,
					targetY
				});
			}

			// Get animation progress
			let progress = edges.progress[i];
			const anim = edgeAnimations.get(edgeId);

			if (anim) {
				const elapsed = now - anim.startTime;
				if (elapsed < 0) {
					progress = anim.startProgress;
				} else {
					const rawProgress = Math.min(elapsed / anim.duration, 1);
					const easedProgress = anim.easing(rawProgress);
					progress =
						anim.startProgress + (anim.targetProgress - anim.startProgress) * easedProgress;

					if (rawProgress >= 1) {
						edges.progress[i] = anim.targetProgress;
						anim.onComplete?.();
						edgeAnimations.delete(edgeId);
					}
				}
			}

			const pathLength = geometry.length;
			const dashOffset = pathLength * (1 - progress);

			const edgeState = cachedEdgeStates[edgeStateIdx];
			edgeState.id = edgeId;
			edgeState.geometry.sourceX = sourceX;
			edgeState.geometry.sourceY = sourceY;
			edgeState.geometry.targetX = targetX;
			edgeState.geometry.targetY = targetY;
			edgeState.geometry.path = geometry.path;
			edgeState.geometry.length = pathLength;
			edgeState.progress = progress;
			edgeState.dashArray = `${pathLength}`;
			edgeState.dashOffset = dashOffset;

			edgeStateIdx++;
		}

		return {
			nodes: cachedNodes.slice(0, n),
			edges: cachedEdgeStates.slice(0, edgeStateIdx),
			tick: tickCount,
			alpha,
			running
		};
	}

	function notify() {
		if (!isDirty && lastMaxMovement < MOVEMENT_THRESHOLD && edgeAnimations.size === 0) {
			return; // Skip if nothing changed
		}

		const state = computeRenderState();
		for (const fn of subscribers) {
			fn(state);
		}
		isDirty = false;
	}

	function simulationTick() {
		const t0 = performance.now();

		lastMaxMovement = applyAllForces(alpha);

		// Alpha decay
		alpha += (config.alphaTarget - alpha) * config.alphaDecay;
		tickCount++;
		isDirty = true;

		const tickTime = performance.now() - t0;

		if (debugEnabled) {
			frameCount++;
			const now = performance.now();
			if (now - lastFpsTime >= 1000) {
				currentFps = frameCount;
				frameCount = 0;
				lastFpsTime = now;
			}

			lastMetrics = {
				tickTime,
				forceTime: tickTime,
				geometryTime: 0,
				animationTime: 0,
				totalTime: tickTime,
				nodeCount: nodes.count,
				edgeCount: edges.count,
				fps: currentFps
			};

			if (tickCount % 60 === 0) {
				console.log(
					`[Force] tick=${tickCount} alpha=${alpha.toFixed(4)} nodes=${nodes.count} edges=${edges.count} tickTime=${tickTime.toFixed(2)}ms fps=${currentFps} maxMove=${lastMaxMovement.toFixed(3)}`
				);
			}
		}
	}

	function loop() {
		if (!running) return;

		const shouldRunPhysics = alpha >= config.alphaMin;

		if (shouldRunPhysics) {
			simulationTick();
		}

		notify();

		const hasActiveAnimations = edgeAnimations.size > 0;

		if (!shouldRunPhysics && !hasActiveAnimations) {
			running = false;
			rafId = null;
			if (debugEnabled) {
				console.log(`[Force] Simulation settled at tick ${tickCount}, stopping`);
			}
			return;
		}

		rafId = requestAnimationFrame(loop);
	}

	return {
		getRenderState: computeRenderState,

		subscribe: (fn) => {
			subscribers.add(fn);
			fn(computeRenderState());
			return () => subscribers.delete(fn);
		},

		addNode: (input) => {
			if (nodes.count >= nodes.capacity) {
				nodes = growNodeArrays(nodes);
			}

			const idx = nodes.count;
			nodes.x[idx] = input.x;
			nodes.y[idx] = input.y;
			nodes.vx[idx] = 0;
			nodes.vy[idx] = 0;
			nodes.radius[idx] = input.radius;
			nodes.mass[idx] = input.mass;
			nodes.flags[idx] =
				(input.fixed ? NODE_FLAG_FIXED : 0) | (input.dragging ? NODE_FLAG_DRAGGING : 0);
			nodes.ids[idx] = input.id;
			nodes.data[idx] = input.data;
			nodes.count++;

			nodeIdToIdx.set(input.id, idx);
			isDirty = true;
			notify();
		},

		removeNode: (id) => {
			const idx = nodeIdToIdx.get(id);
			if (idx === undefined) return;

			const lastIdx = nodes.count - 1;

			// Swap with last
			if (idx !== lastIdx) {
				nodes.x[idx] = nodes.x[lastIdx];
				nodes.y[idx] = nodes.y[lastIdx];
				nodes.vx[idx] = nodes.vx[lastIdx];
				nodes.vy[idx] = nodes.vy[lastIdx];
				nodes.radius[idx] = nodes.radius[lastIdx];
				nodes.mass[idx] = nodes.mass[lastIdx];
				nodes.flags[idx] = nodes.flags[lastIdx];
				nodes.ids[idx] = nodes.ids[lastIdx];
				nodes.data[idx] = nodes.data[lastIdx];
				nodeIdToIdx.set(nodes.ids[idx], idx);
			}

			nodes.count--;
			nodeIdToIdx.delete(id);

			// Remove connected edges
			for (let i = edges.count - 1; i >= 0; i--) {
				const edgeId = edges.ids[i];
				const si = edges.sourceIdx[i];
				const ti = edges.targetIdx[i];
				const sourceId = nodes.ids[si] ?? id;
				const targetId = nodes.ids[ti] ?? id;

				if (sourceId === id || targetId === id) {
					geometryCache.delete(edgeId);
					edgeAnimations.delete(edgeId);
					edgeIdToIdx.delete(edgeId);

					const lastEdgeIdx = edges.count - 1;
					if (i !== lastEdgeIdx) {
						edges.sourceIdx[i] = edges.sourceIdx[lastEdgeIdx];
						edges.targetIdx[i] = edges.targetIdx[lastEdgeIdx];
						edges.strength[i] = edges.strength[lastEdgeIdx];
						edges.progress[i] = edges.progress[lastEdgeIdx];
						edges.ids[i] = edges.ids[lastEdgeIdx];
						edgeIdToIdx.set(edges.ids[i], i);
					}
					edges.count--;
				}
			}

			isDirty = true;
			notify();
		},

		getNode: (id) => {
			const idx = nodeIdToIdx.get(id);
			if (idx === undefined) return undefined;

			return {
				id: nodes.ids[idx],
				x: nodes.x[idx],
				y: nodes.y[idx],
				vx: nodes.vx[idx],
				vy: nodes.vy[idx],
				radius: nodes.radius[idx],
				mass: nodes.mass[idx],
				fixed: !!(nodes.flags[idx] & NODE_FLAG_FIXED),
				dragging: !!(nodes.flags[idx] & NODE_FLAG_DRAGGING),
				data: nodes.data[idx]
			};
		},

		addEdge: (edge) => {
			const sourceIdx = nodeIdToIdx.get(edge.source);
			const targetIdx = nodeIdToIdx.get(edge.target);
			if (sourceIdx === undefined || targetIdx === undefined) return;

			if (edges.count >= edges.capacity) {
				edges = growEdgeArrays(edges);
			}

			const idx = edges.count;
			edges.sourceIdx[idx] = sourceIdx;
			edges.targetIdx[idx] = targetIdx;
			edges.strength[idx] = edge.strength;
			edges.ids[idx] = edge.id;
			edges.progress[idx] = 0;
			edges.count++;

			edgeIdToIdx.set(edge.id, idx);
			isDirty = true;
			notify();
		},

		removeEdge: (id) => {
			const idx = edgeIdToIdx.get(id);
			if (idx === undefined) return;

			geometryCache.delete(id);
			edgeAnimations.delete(id);

			const lastIdx = edges.count - 1;
			if (idx !== lastIdx) {
				edges.sourceIdx[idx] = edges.sourceIdx[lastIdx];
				edges.targetIdx[idx] = edges.targetIdx[lastIdx];
				edges.strength[idx] = edges.strength[lastIdx];
				edges.progress[idx] = edges.progress[lastIdx];
				edges.ids[idx] = edges.ids[lastIdx];
				edgeIdToIdx.set(edges.ids[idx], idx);
			}

			edges.count--;
			edgeIdToIdx.delete(id);

			isDirty = true;
			notify();
		},

		setForceConfig: (cfg) => {
			forceConfig = { ...forceConfig, ...cfg };
		},

		start: () => {
			if (running) return;
			running = true;
			if (debugEnabled) {
				console.log('[Force] Simulation started');
				lastFpsTime = performance.now();
				frameCount = 0;
			}
			loop();
		},

		stop: () => {
			running = false;
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			if (debugEnabled) {
				console.log('[Force] Simulation stopped');
			}
		},

		tick: simulationTick,

		reheat: (newAlpha = 0.3) => {
			alpha = newAlpha;
			isDirty = true;
			if (debugEnabled) {
				console.log(`[Force] Reheated to alpha=${newAlpha}`);
			}
			if (!running) {
				running = true;
				loop();
			}
		},

		dragStart: (nodeId) => {
			const idx = nodeIdToIdx.get(nodeId);
			if (idx === undefined) return;

			nodes.flags[idx] |= NODE_FLAG_DRAGGING;
			alpha = Math.max(alpha, 0.3);
			isDirty = true;

			if (!running) {
				running = true;
				loop();
			}
			notify();
		},

		dragMove: (nodeId, x, y) => {
			const idx = nodeIdToIdx.get(nodeId);
			if (idx === undefined) return;

			nodes.x[idx] = x;
			nodes.y[idx] = y;
			nodes.vx[idx] = 0;
			nodes.vy[idx] = 0;
			isDirty = true;
			notify();
		},

		dragEnd: (nodeId) => {
			const idx = nodeIdToIdx.get(nodeId);
			if (idx === undefined) return;

			nodes.flags[idx] &= ~NODE_FLAG_DRAGGING;
			isDirty = true;
			notify();
		},

		animateEdge: (edgeId, options = {}) => {
			const {
				duration = 400,
				direction = 'draw',
				easing = easings.easeOutCubic,
				delay = 0,
				onComplete
			} = options;

			const idx = edgeIdToIdx.get(edgeId);
			if (idx === undefined) return;

			const currentProgress = edges.progress[idx];
			const targetProgress = direction === 'draw' ? 1 : 0;

			edgeAnimations.set(edgeId, {
				edgeId,
				startProgress: currentProgress,
				targetProgress,
				startTime: performance.now() + delay,
				duration,
				easing,
				onComplete
			});

			isDirty = true;
			if (!running) {
				running = true;
				loop();
			}
		},

		animateEdges: (edgeIds, options = {}) => {
			const {
				duration = 400,
				stagger = 50,
				direction = 'draw',
				easing = easings.easeOutCubic,
				onAllComplete
			} = options;

			const now = performance.now();
			const lastI = edgeIds.length - 1;

			for (let i = 0; i < edgeIds.length; i++) {
				const edgeId = edgeIds[i];
				const idx = edgeIdToIdx.get(edgeId);
				if (idx === undefined) continue;

				const currentProgress = edges.progress[idx];
				const targetProgress = direction === 'draw' ? 1 : 0;

				edgeAnimations.set(edgeId, {
					edgeId,
					startProgress: currentProgress,
					targetProgress,
					startTime: now + i * stagger,
					duration,
					easing,
					onComplete: i === lastI ? onAllComplete : undefined
				});
			}

			isDirty = true;
			if (!running) {
				running = true;
				loop();
			}
		},

		getEdgeProgress: (edgeId) => {
			const anim = edgeAnimations.get(edgeId);
			if (anim) {
				const elapsed = performance.now() - anim.startTime;
				if (elapsed < 0) return anim.startProgress;
				const rawProgress = Math.min(elapsed / anim.duration, 1);
				const easedProgress = anim.easing(rawProgress);
				return anim.startProgress + (anim.targetProgress - anim.startProgress) * easedProgress;
			}
			const idx = edgeIdToIdx.get(edgeId);
			return idx !== undefined ? edges.progress[idx] : 0;
		},

		destroy: () => {
			running = false;
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			subscribers.clear();
			nodeIdToIdx.clear();
			edgeIdToIdx.clear();
			geometryCache.clear();
			edgeAnimations.clear();
			cachedNodes = [];
			cachedEdgeStates = [];
			if (debugEnabled) {
				console.log('[Force] Simulation destroyed');
			}
		}
	};
}
