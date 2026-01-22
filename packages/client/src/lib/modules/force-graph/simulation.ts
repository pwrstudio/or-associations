import type {
	ForceNode,
	ForceEdge,
	ForceNodeInput,
	SimulationConfig,
	SimulationState,
	ForceFunction,
	Vec2
} from './types';

export interface Simulation {
	getState: () => SimulationState;
	subscribe: (fn: (state: SimulationState) => void) => () => void;
	addNode: (node: ForceNodeInput) => void;
	removeNode: (id: string) => void;
	updateNode: (id: string, updates: Partial<ForceNode>) => void;
	addEdge: (edge: ForceEdge) => void;
	removeEdge: (id: string) => void;
	addForce: (name: string, force: ForceFunction) => void;
	removeForce: (name: string) => void;
	start: () => void;
	stop: () => void;
	tick: () => SimulationState;
	reheat: (alpha?: number) => void;
	dragStart: (nodeId: string) => void;
	dragMove: (nodeId: string, x: number, y: number) => void;
	dragEnd: (nodeId: string) => void;
	destroy: () => void;
}

const defaultConfig: SimulationConfig = {
	alpha: 1,
	alphaDecay: 0.0228,
	alphaMin: 0.001,
	alphaTarget: 0,
	velocityDecay: 0.4,
	width: 600,
	height: 600
};

export function createSimulation(initialConfig: Partial<SimulationConfig> = {}): Simulation {
	const config: SimulationConfig = { ...defaultConfig, ...initialConfig };

	let state: SimulationState = {
		nodes: new Map(),
		edges: new Map(),
		config,
		tick: 0,
		running: false
	};

	const forces = new Map<string, ForceFunction>();
	let rafId: number | null = null;
	const subscribers = new Set<(state: SimulationState) => void>();

	function notifySubscribers() {
		subscribers.forEach((fn) => fn(state));
	}

	function simulationTick(): SimulationState {
		// Accumulate forces
		const velocityDeltas = new Map<string, Vec2>();

		state.nodes.forEach((_, id) => {
			velocityDeltas.set(id, { x: 0, y: 0 });
		});

		// Apply each force
		forces.forEach((force) => {
			const deltas = force(state, state.config.alpha);
			deltas.forEach((delta, id) => {
				const current = velocityDeltas.get(id);
				if (current) {
					velocityDeltas.set(id, {
						x: current.x + delta.x,
						y: current.y + delta.y
					});
				}
			});
		});

		// Update velocities and positions
		const newNodes = new Map<string, ForceNode>();

		state.nodes.forEach((node, id) => {
			if (node.fixed || node.dragging) {
				newNodes.set(id, { ...node, vx: 0, vy: 0 });
				return;
			}

			const delta = velocityDeltas.get(id) || { x: 0, y: 0 };

			// Apply velocity decay (damping)
			const vx = (node.vx + delta.x) * (1 - state.config.velocityDecay);
			const vy = (node.vy + delta.y) * (1 - state.config.velocityDecay);

			// Update position
			const x = node.x + vx;
			const y = node.y + vy;

			newNodes.set(id, { ...node, x, y, vx, vy });
		});

		// Cool down alpha
		const newAlpha =
			state.config.alpha +
			(state.config.alphaTarget - state.config.alpha) * state.config.alphaDecay;

		state = {
			...state,
			nodes: newNodes,
			config: { ...state.config, alpha: newAlpha },
			tick: state.tick + 1
		};

		return state;
	}

	function loop() {
		if (!state.running) return;

		simulationTick();
		notifySubscribers();

		// Keep running even when cooled (for idle animation)
		rafId = requestAnimationFrame(loop);
	}

	return {
		getState: () => state,

		subscribe: (fn: (state: SimulationState) => void) => {
			subscribers.add(fn);
			fn(state); // Immediate call
			return () => subscribers.delete(fn);
		},

		addNode: (input: ForceNodeInput) => {
			const node: ForceNode = {
				...input,
				vx: 0,
				vy: 0,
				dragging: input.dragging ?? false
			};
			const newNodes = new Map(state.nodes);
			newNodes.set(node.id, node);
			state = { ...state, nodes: newNodes };
			notifySubscribers();
		},

		removeNode: (id: string) => {
			const newNodes = new Map(state.nodes);
			newNodes.delete(id);
			// Also remove edges connected to this node
			const newEdges = new Map(state.edges);
			state.edges.forEach((edge, edgeId) => {
				if (edge.source === id || edge.target === id) {
					newEdges.delete(edgeId);
				}
			});
			state = { ...state, nodes: newNodes, edges: newEdges };
			notifySubscribers();
		},

		updateNode: (id: string, updates: Partial<ForceNode>) => {
			const node = state.nodes.get(id);
			if (!node) return;
			const newNodes = new Map(state.nodes);
			newNodes.set(id, { ...node, ...updates });
			state = { ...state, nodes: newNodes };
			notifySubscribers();
		},

		addEdge: (edge: ForceEdge) => {
			const newEdges = new Map(state.edges);
			newEdges.set(edge.id, edge);
			state = { ...state, edges: newEdges };
			notifySubscribers();
		},

		removeEdge: (id: string) => {
			const newEdges = new Map(state.edges);
			newEdges.delete(id);
			state = { ...state, edges: newEdges };
			notifySubscribers();
		},

		addForce: (name: string, force: ForceFunction) => {
			forces.set(name, force);
		},

		removeForce: (name: string) => {
			forces.delete(name);
		},

		start: () => {
			if (state.running) return;
			state = { ...state, running: true };
			loop();
		},

		stop: () => {
			state = { ...state, running: false };
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		},

		tick: () => simulationTick(),

		reheat: (alpha = 0.3) => {
			state = {
				...state,
				config: { ...state.config, alpha }
			};
			if (!state.running) {
				state = { ...state, running: true };
				loop();
			}
		},

		dragStart: (nodeId: string) => {
			const node = state.nodes.get(nodeId);
			if (!node) return;

			const newNodes = new Map(state.nodes);
			newNodes.set(nodeId, { ...node, dragging: true });
			state = {
				...state,
				nodes: newNodes,
				config: { ...state.config, alpha: Math.max(state.config.alpha, 0.3) }
			};

			if (!state.running) {
				state = { ...state, running: true };
				loop();
			}
			notifySubscribers();
		},

		dragMove: (nodeId: string, x: number, y: number) => {
			const node = state.nodes.get(nodeId);
			if (!node) return;

			const newNodes = new Map(state.nodes);
			newNodes.set(nodeId, { ...node, x, y, vx: 0, vy: 0 });
			state = { ...state, nodes: newNodes };
			// Don't notify here - let the loop handle it for smoother updates
		},

		dragEnd: (nodeId: string) => {
			const node = state.nodes.get(nodeId);
			if (!node) return;

			const newNodes = new Map(state.nodes);
			newNodes.set(nodeId, { ...node, dragging: false });
			state = { ...state, nodes: newNodes };
			notifySubscribers();
		},

		destroy: () => {
			state = { ...state, running: false };
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			subscribers.clear();
			forces.clear();
		}
	};
}
