import type { LineAnimation, EasingFunction } from './types';

// Common easing functions
export const easings = {
	linear: (t: number) => t,
	easeInQuad: (t: number) => t * t,
	easeOutQuad: (t: number) => t * (2 - t),
	easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
	easeInCubic: (t: number) => t * t * t,
	easeOutCubic: (t: number) => --t * t * t + 1,
	easeInOutCubic: (t: number) =>
		t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
};

export interface AnimationController {
	subscribe: (fn: (animations: Map<string, LineAnimation>) => void) => () => void;
	drawLine: (
		edgeId: string,
		options?: {
			duration?: number;
			direction?: 'forward' | 'reverse' | 'both';
			easing?: EasingFunction;
			delay?: number;
			onComplete?: () => void;
		}
	) => void;
	drawSequence: (
		edgeIds: string[],
		options?: {
			duration?: number;
			stagger?: number;
			easing?: EasingFunction;
			onAllComplete?: () => void;
		}
	) => void;
	retractLine: (
		edgeId: string,
		options?: {
			duration?: number;
			easing?: EasingFunction;
			delay?: number;
		}
	) => void;
	retractAll: (options?: { duration?: number; stagger?: number; easing?: EasingFunction }) => void;
	getProgress: (edgeId: string) => number;
	isAnimating: (edgeId: string) => boolean;
	cancel: (edgeId: string) => void;
	cancelAll: () => void;
	destroy: () => void;
}

export function createAnimationController(): AnimationController {
	const animations = new Map<string, LineAnimation>();
	const completedProgress = new Map<string, number>(); // Track final state
	let rafId: number | null = null;
	const subscribers = new Set<(animations: Map<string, LineAnimation>) => void>();

	function notify() {
		subscribers.forEach((fn) => fn(animations));
	}

	function tick(timestamp: number) {
		let hasActive = false;

		animations.forEach((anim, id) => {
			const elapsed = timestamp - anim.startTime;

			if (elapsed < 0) {
				// Delayed animation not yet started
				hasActive = true;
				return;
			}

			const rawProgress = Math.min(elapsed / anim.duration, 1);
			const easedProgress = anim.easing(rawProgress);

			anim.progress = easedProgress;

			if (rawProgress < 1) {
				hasActive = true;
			} else {
				completedProgress.set(id, anim.direction === 'reverse' ? 0 : 1);
				anim.onComplete?.();
				animations.delete(id);
			}
		});

		notify();

		if (hasActive) {
			rafId = requestAnimationFrame(tick);
		} else {
			rafId = null;
		}
	}

	function startLoop() {
		if (!rafId) {
			rafId = requestAnimationFrame(tick);
		}
	}

	return {
		subscribe: (fn) => {
			subscribers.add(fn);
			return () => subscribers.delete(fn);
		},

		drawLine: (edgeId, options = {}) => {
			const {
				duration = 400,
				direction = 'forward',
				easing = easings.easeOutCubic,
				delay = 0,
				onComplete
			} = options;

			animations.set(edgeId, {
				edgeId,
				progress: 0,
				direction,
				duration,
				startTime: performance.now() + delay,
				easing,
				onComplete
			});

			completedProgress.delete(edgeId);
			startLoop();
		},

		drawSequence: (edgeIds, options = {}) => {
			const {
				duration = 400,
				stagger = 50,
				easing = easings.easeOutCubic,
				onAllComplete
			} = options;

			const now = performance.now();

			edgeIds.forEach((id, index) => {
				const isLast = index === edgeIds.length - 1;

				animations.set(id, {
					edgeId: id,
					progress: 0,
					direction: 'forward',
					duration,
					startTime: now + index * stagger,
					easing,
					onComplete: isLast ? onAllComplete : undefined
				});

				completedProgress.delete(id);
			});

			startLoop();
		},

		retractLine: (edgeId, options = {}) => {
			const { duration = 300, easing = easings.easeInCubic, delay = 0 } = options;

			animations.set(edgeId, {
				edgeId,
				progress: 1,
				direction: 'reverse',
				duration,
				startTime: performance.now() + delay,
				easing: (t) => 1 - easing(t),
				onComplete: undefined
			});

			completedProgress.delete(edgeId);
			startLoop();
		},

		retractAll: (options = {}) => {
			const { duration = 300, stagger = 30, easing = easings.easeInCubic } = options;

			const now = performance.now();
			const edgeIds = Array.from(completedProgress.keys());

			edgeIds.forEach((id, index) => {
				animations.set(id, {
					edgeId: id,
					progress: 1,
					direction: 'reverse',
					duration,
					startTime: now + index * stagger,
					easing: (t) => 1 - easing(t),
					onComplete: undefined
				});

				completedProgress.delete(id);
			});

			startLoop();
		},

		getProgress: (edgeId) => {
			const anim = animations.get(edgeId);
			if (anim) return anim.progress;
			return completedProgress.get(edgeId) ?? 0;
		},

		isAnimating: (edgeId) => animations.has(edgeId),

		cancel: (edgeId) => {
			animations.delete(edgeId);
		},

		cancelAll: () => {
			animations.clear();
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		},

		destroy: () => {
			animations.clear();
			completedProgress.clear();
			subscribers.clear();
			if (rafId) cancelAnimationFrame(rafId);
		}
	};
}

/**
 * Calculate stroke-dasharray and stroke-dashoffset for line drawing effect
 */
export function getLineDrawStyles(
	pathLength: number,
	progress: number,
	direction: 'forward' | 'reverse' | 'both' = 'forward'
): { dashArray: string; dashOffset: number } {
	if (direction === 'both') {
		// Draw from center outward in both directions
		const halfLength = pathLength / 2;
		const visibleLength = halfLength * progress;

		return {
			dashArray: `${visibleLength} ${pathLength}`,
			dashOffset: halfLength - visibleLength
		};
	}

	const visibleLength = pathLength * progress;
	const offset = direction === 'forward' ? pathLength - visibleLength : visibleLength - pathLength;

	return {
		dashArray: `${pathLength}`,
		dashOffset: offset
	};
}
