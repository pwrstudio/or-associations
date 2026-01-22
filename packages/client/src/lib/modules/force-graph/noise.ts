/**
 * Seeded random number generator (Mulberry32)
 */
function mulberry32(seed: number): () => number {
	return function () {
		let t = (seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Create a 2D Perlin noise function
 */
export function createNoise2D(seed: number = Math.random() * 10000) {
	const perm = new Uint8Array(512);
	const grad = [
		[1, 1],
		[-1, 1],
		[1, -1],
		[-1, -1],
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];

	// Seed-based shuffle
	const random = mulberry32(seed);
	for (let i = 0; i < 256; i++) perm[i] = i;
	for (let i = 255; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[perm[i], perm[j]] = [perm[j], perm[i]];
	}
	for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

	function fade(t: number): number {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	function lerp(t: number, a: number, b: number): number {
		return a + t * (b - a);
	}

	function dot(g: number[], x: number, y: number): number {
		return g[0] * x + g[1] * y;
	}

	return function noise(x: number, y: number): number {
		const X = Math.floor(x) & 255;
		const Y = Math.floor(y) & 255;

		x -= Math.floor(x);
		y -= Math.floor(y);

		const u = fade(x);
		const v = fade(y);

		const a = perm[X] + Y;
		const b = perm[X + 1] + Y;

		const g00 = grad[perm[a] & 7];
		const g10 = grad[perm[b] & 7];
		const g01 = grad[perm[a + 1] & 7];
		const g11 = grad[perm[b + 1] & 7];

		const n00 = dot(g00, x, y);
		const n10 = dot(g10, x - 1, y);
		const n01 = dot(g01, x, y - 1);
		const n11 = dot(g11, x - 1, y - 1);

		return lerp(v, lerp(u, n00, n10), lerp(u, n01, n11));
	};
}
