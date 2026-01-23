// Vector utilities
export interface Vec2 {
	x: number;
	y: number;
}

// Node state - object form (for external API)
export interface ForceNode {
	id: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	mass: number;
	fixed: boolean;
	dragging: boolean;
	data?: Record<string, unknown>;
}

// Edge definition
export interface ForceEdge {
	id: string;
	source: string;
	target: string;
	strength: number;
}

// Simulation configuration
export interface SimulationConfig {
	alpha: number;
	alphaDecay: number;
	alphaMin: number;
	alphaTarget: number;
	velocityDecay: number;
	width: number;
	height: number;
}

// Computed edge geometry (cached)
export interface EdgeGeometry {
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	path: string;
	length: number;
}

// Edge render state (geometry + animation)
export interface EdgeRenderState {
	id: string;
	geometry: EdgeGeometry;
	progress: number;
	dashArray: string;
	dashOffset: number;
}

// Complete render state - what components receive
export interface RenderState {
	nodes: ForceNode[];
	edges: EdgeRenderState[];
	tick: number;
	alpha: number;
	running: boolean;
}

// Force function signature - mutates velocities directly
export type ForceFunction = (nodes: ForceNode[], edges: ForceEdge[], alpha: number) => void;

// Animation state
export interface EdgeAnimation {
	edgeId: string;
	startProgress: number;
	targetProgress: number;
	startTime: number;
	duration: number;
	easing: (t: number) => number;
	onComplete?: () => void;
}

// Node input (without velocity)
export type ForceNodeInput = Omit<ForceNode, 'vx' | 'vy' | 'dragging'> & {
	dragging?: boolean;
};

// Easing function type
export type EasingFunction = (t: number) => number;

/**
 * Physics configuration for tweaking the simulation feel
 */
export interface PhysicsConfig {
	// === Simulation Parameters ===
	/** Initial energy level (0-1). Higher = more initial movement. Default: 0.3 */
	alpha?: number;
	/** How fast energy decays (0-1). Lower = longer settling time. Default: 0.03 */
	alphaDecay?: number;
	/** Velocity damping (0-1). Lower = more momentum/fluid. Higher = more sluggish. Default: 0.3 */
	velocityDecay?: number;

	// === Center Force ===
	/** Pull toward center (0-1). Higher = tighter grouping. Default: 0.08 */
	centerStrength?: number;

	// === Repulsion Force ===
	/** Repulsion between nodes (negative). More negative = stronger push. Default: -100 */
	repelStrength?: number;
	/** Min distance for repulsion calculation. Default: 10 */
	repelDistanceMin?: number;
	/** Max distance for repulsion effect. Default: 400 */
	repelDistanceMax?: number;

	// === Link Force ===
	/** Spring strength for links (0-1). Higher = stiffer springs. Default: 0.4 */
	linkStrength?: number;

	// === Collision Force ===
	/** Collision response strength. Higher = harder collisions. Default: 1.5 */
	collisionStrength?: number;
	/** Extra padding between nodes (px). Default: 30 */
	collisionPadding?: number;

	// === Radial Force ===
	/** Min distance from center (added to centerRadius). Default: 70 */
	radialPadding?: number;
	/** Radial push strength. Default: 1.0 */
	radialStrength?: number;

	// === Animation ===
	/** Edge draw animation duration (ms). Default: 350 */
	drawDuration?: number;
	/** Stagger between edge animations (ms). Default: 40 */
	drawStagger?: number;
	/** Edge retract animation duration (ms). Default: 250 */
	retractDuration?: number;
	/** Stagger for retract animations (ms). Default: 20 */
	retractStagger?: number;

	// === Opening Jitter ===
	/** Random position offset when opening (px). 0 = no jitter. Default: 30 */
	openJitter?: number;
}

// ============================================
// Struct-of-Arrays (SoA) TypedArray structures
// For high-performance internal representation
// ============================================

/**
 * Node data stored as parallel TypedArrays (Struct of Arrays)
 * Much faster iteration and better cache locality than Array of Objects
 */
export interface NodeArrays {
	// Positions and velocities (hot path - updated every frame)
	x: Float32Array;
	y: Float32Array;
	vx: Float32Array;
	vy: Float32Array;

	// Properties (warm path - read frequently)
	radius: Float32Array;
	mass: Float32Array;

	// Flags packed as bits: bit 0 = fixed, bit 1 = dragging
	flags: Uint8Array;

	// Metadata (cold path - rarely accessed during simulation)
	ids: string[];
	data: (Record<string, unknown> | undefined)[];

	// Current count (arrays may be over-allocated)
	count: number;
	capacity: number;
}

/**
 * Edge data stored as parallel arrays
 */
export interface EdgeArrays {
	// Source and target as indices into NodeArrays
	sourceIdx: Uint16Array;
	targetIdx: Uint16Array;

	// Edge properties
	strength: Float32Array;

	// Metadata
	ids: string[];

	// Animation state
	progress: Float32Array;

	// Current count
	count: number;
	capacity: number;
}

// Flag bit masks
export const NODE_FLAG_FIXED = 1;
export const NODE_FLAG_DRAGGING = 2;
