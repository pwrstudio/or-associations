<script lang="ts">
	import type { NodeData } from '$lib/types';
	import type { GeoPoint } from '$lib/modules/geodesic';

	interface MeetingPointData {
		point: GeoPoint;
		totalDistanceKm: number;
		averageDistanceKm: number;
	}

	let {
		nodes,
		median,
		centroid,
		nodeCount
	}: {
		nodes: NodeData[];
		median: MeetingPointData | null;
		centroid: MeetingPointData | null;
		nodeCount: number;
	} = $props();

	function formatDate(isoString: string | undefined): string {
		if (!isoString) return '';
		return new Date(isoString).toLocaleDateString();
	}
</script>

<h1>or-associations</h1>

{#if median || centroid}
	<section class="meeting-points">
		{#if centroid}
			<div class="meeting-point centroid">
				<h2>Centroid (Geographic Center)</h2>
				<p class="coordinates">
					{centroid.point.lat.toFixed(4)}, {centroid.point.lng.toFixed(4)}
				</p>
				<dl>
					<dt>Total distance</dt>
					<dd>{centroid.totalDistanceKm.toLocaleString()} km</dd>
					<dt>Average distance</dt>
					<dd>{centroid.averageDistanceKm.toLocaleString()} km</dd>
				</dl>
			</div>
		{/if}
		{#if nodeCount}
			<p class="member-count">{nodeCount} members</p>
		{/if}
	</section>
{/if}

{#if nodes && nodes.length > 0}
	<section class="nodes">
		<h2>Members ({nodes.length})</h2>
		<ul>
			{#each nodes as node}
				<li>
					<span class="location">
						{[node.city, node.country].filter(Boolean).join(', ') || 'Unknown'}
					</span>
					{#if node.timezone}
						<span class="timezone">{node.timezone}</span>
					{/if}
					{#if node.checkedInAt}
						<span class="date">{formatDate(node.checkedInAt)}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<p>No members have checked in yet.</p>
{/if}

<style lang="scss">
	h1 {
		margin-bottom: var(--spacing-xl);
	}

	.meeting-points {
		margin-bottom: var(--spacing-xl);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-md);

		.member-count {
			grid-column: 1 / -1;
			margin: 0;
			color: var(--color-text-muted);
			font-size: var(--font-size-sm);
		}
	}

	.meeting-point {
		padding: var(--spacing-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);

		&.centroid {
			background: var(--color-surface-alt);
		}

		h2 {
			margin: 0 0 var(--spacing-sm);
			font-size: var(--font-size-sm);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		.coordinates {
			font-size: var(--font-size-lg);
			font-weight: var(--font-weight-bold);
			margin: 0 0 var(--spacing-md);
			font-family: var(--font-family-mono);
		}

		dl {
			display: grid;
			grid-template-columns: auto 1fr;
			gap: var(--spacing-xs) var(--spacing-md);
			font-size: var(--font-size-sm);
		}

		dt {
			color: var(--color-text-muted);
		}

		dd {
			font-weight: var(--font-weight-medium);
		}
	}

	.nodes {
		h2 {
			margin: 0 0 var(--spacing-md);
			font-size: var(--font-size-base);
		}

		li {
			display: flex;
			gap: var(--spacing-md);
			padding: var(--spacing-sm) 0;
			border-bottom: 1px solid var(--color-border-light);
		}

		.location {
			flex: 1;
		}

		.timezone {
			color: var(--color-text-muted);
			font-size: var(--font-size-sm);
		}

		.date {
			color: var(--color-text-subtle);
			font-size: var(--font-size-sm);
		}
	}
</style>
