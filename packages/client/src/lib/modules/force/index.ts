// Types
export type {
	Vec2,
	ForceNode,
	ForceEdge,
	ForceNodeInput,
	SimulationConfig,
	ForceFunction,
	RenderState,
	EdgeRenderState,
	EdgeGeometry,
	EdgeAnimation,
	NodeAnimation,
	EasingFunction,
	PhysicsConfig
} from './types';

// Simulation
export {
	createSimulation,
	enablePerformanceLogging,
	getPerformanceMetrics,
	easings,
	type Simulation,
	type PerformanceMetrics
} from './simulation';

// Forces
export {
	createCenterForce,
	createManyBodyForce,
	createLinkForce,
	createCollisionForce,
	createRadialMinDistanceForce,
	createBoundsForce
} from './forces';

// Geometry
export { computeEdgeGeometry, GEOMETRY_THRESHOLD } from './geometry';
