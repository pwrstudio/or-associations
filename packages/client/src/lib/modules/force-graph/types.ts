// Vector utilities
export interface Vec2 {
	x: number;
	y: number;
}

// Node state
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

// Simulation state
export interface SimulationState {
	nodes: Map<string, ForceNode>;
	edges: Map<string, ForceEdge>;
	config: SimulationConfig;
	tick: number;
	running: boolean;
}

// Force function signature
export type ForceFunction = (state: SimulationState, alpha: number) => Map<string, Vec2>;

// Edge point with angle
export interface EdgePoint {
	x: number;
	y: number;
	angle: number;
}

// Bezier curve
export interface BezierCurve {
	start: Vec2;
	cp1: Vec2;
	cp2: Vec2;
	end: Vec2;
}

// Line animation state
export interface LineAnimation {
	edgeId: string;
	progress: number;
	direction: 'forward' | 'reverse' | 'both';
	duration: number;
	startTime: number;
	easing: EasingFunction;
	onComplete?: () => void;
}

export type EasingFunction = (t: number) => number;

// Node input (without velocity)
export type ForceNodeInput = Omit<ForceNode, 'vx' | 'vy' | 'dragging'> & {
	dragging?: boolean;
};
