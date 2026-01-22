<script lang="ts">
	import { onMount } from 'svelte';
	import type { NodeData } from '$lib/types';
	import type { GeoPoint } from '$lib/modules/geodesic';

	interface MeetingPointData {
		point: GeoPoint;
		totalDistanceKm: number;
		averageDistanceKm: number;
	}

	let {
		nodes,
		centroid
	}: {
		nodes: NodeData[];
		centroid: MeetingPointData | null;
	} = $props();

	// Clock state - map from timezone to time string
	let clocks = $state<Map<string, string>>(new Map());

	function getTimeForTimezone(timezone: string): string {
		try {
			const formatter = new Intl.DateTimeFormat('en-GB', {
				timeZone: timezone,
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
			return formatter.format(new Date());
		} catch {
			return '--:--:--';
		}
	}

	function updateClocks() {
		const newClocks = new Map<string, string>();
		const seenTimezones = new Set<string>();

		for (const node of nodes) {
			if (node.timezone && !seenTimezones.has(node.timezone)) {
				seenTimezones.add(node.timezone);
				newClocks.set(node.timezone, getTimeForTimezone(node.timezone));
			}
		}
		clocks = newClocks;
	}

	onMount(() => {
		updateClocks();
		const interval = setInterval(updateClocks, 1000);
		return () => clearInterval(interval);
	});

	function formatCoord(val: number | undefined, isLat: boolean): string {
		if (val === undefined) return '--';
		const dir = isLat ? (val >= 0 ? 'N' : 'S') : val >= 0 ? 'E' : 'W';
		return `${Math.abs(val).toFixed(4)}° ${dir}`;
	}
</script>

<div class="node-info">
	{#if nodes && nodes.length > 0}
		<section class="nodes">
			<h2>Nodes ({nodes.length})</h2>
			<ul>
				{#each nodes as node}
					<li>
						<span class="city">{node.city || 'Unknown'}</span>
						<span class="coords">
							{formatCoord(node.geopoint?.lat, true)}, {formatCoord(node.geopoint?.lng, false)}
						</span>
						<span class="time"
							>{node.timezone ? clocks.get(node.timezone) || '--:--:--' : '--:--:--'}</span
						>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if centroid}
		<section class="centroid">
			<h2>Centroid</h2>
			<p class="coords">
				{formatCoord(centroid.point.lat, true)}, {formatCoord(centroid.point.lng, false)}
			</p>
			<p class="distances">
				Total: {centroid.totalDistanceKm.toLocaleString()} km / Avg: {centroid.averageDistanceKm.toLocaleString()}
				km
			</p>
		</section>
	{/if}
</div>

<style lang="scss">
	.node-info {
		position: fixed;
		top: var(--spacing-md, 1rem);
		left: var(--spacing-md, 1rem);
		z-index: 10;
		font-size: 10px;
		font-family: var(--font-family-mono, monospace);
	}

	section {
		margin-bottom: var(--spacing-md, 1rem);
	}

	h2 {
		margin: 0 0 var(--spacing-xs, 0.25rem);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		gap: var(--spacing-md, 1rem);
	}

	.centroid {
		.coords {
			margin: 0;
			font-weight: 600;
		}

		.distances {
			margin: var(--spacing-xs, 0.25rem) 0 0;
			opacity: 0.7;
		}
	}

	.nodes {
		.city {
			min-width: 100px;
		}

		.time {
			font-variant-numeric: tabular-nums;
			min-width: 70px;
			text-align: right;
		}
	}
</style>
