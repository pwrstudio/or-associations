<script lang="ts">
	import Metadata from '$lib/components/Metadata.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(isoString: string | undefined): string {
		if (!isoString) return '';
		return new Date(isoString).toLocaleDateString();
	}
</script>

<Metadata type="landing" />

<h1>or-associations</h1>

{#if data.median || data.centroid}
	<section class="meeting-points">
		{#if data.median}
			<div class="meeting-point">
				<h2>Median (Best Meeting Point)</h2>
				<p class="coordinates">
					{data.median.point.lat.toFixed(4)}, {data.median.point.lng.toFixed(4)}
				</p>
				<dl>
					<dt>Total distance</dt>
					<dd>{data.median.totalDistanceKm.toLocaleString()} km</dd>
					<dt>Average distance</dt>
					<dd>{data.median.averageDistanceKm.toLocaleString()} km</dd>
				</dl>
			</div>
		{/if}
		{#if data.centroid}
			<div class="meeting-point centroid">
				<h2>Centroid (Geographic Center)</h2>
				<p class="coordinates">
					{data.centroid.point.lat.toFixed(4)}, {data.centroid.point.lng.toFixed(4)}
				</p>
				<dl>
					<dt>Total distance</dt>
					<dd>{data.centroid.totalDistanceKm.toLocaleString()} km</dd>
					<dt>Average distance</dt>
					<dd>{data.centroid.averageDistanceKm.toLocaleString()} km</dd>
				</dl>
			</div>
		{/if}
		{#if data.nodeCount}
			<p class="member-count">{data.nodeCount} members</p>
		{/if}
	</section>
{/if}

{#if data.nodes && data.nodes.length > 0}
	<section class="nodes">
		<h2>Members ({data.nodes.length})</h2>
		<ul>
			{#each data.nodes as node}
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
		margin-bottom: 2rem;
	}

	.meeting-points {
		margin-bottom: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;

		.member-count {
			grid-column: 1 / -1;
			margin: 0;
			color: #666;
			font-size: 0.875rem;
		}
	}

	.meeting-point {
		padding: 1rem;
		background: #f0f0f0;
		border-radius: 4px;

		&.centroid {
			background: #e8e8e8;
		}

		h2 {
			margin: 0 0 0.5rem;
			font-size: 0.875rem;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		.coordinates {
			font-size: 1.125rem;
			font-weight: bold;
			margin: 0 0 1rem;
			font-family: monospace;
		}

		dl {
			display: grid;
			grid-template-columns: auto 1fr;
			gap: 0.25rem 1rem;
			margin: 0;
			font-size: 0.875rem;
		}

		dt {
			color: #666;
		}

		dd {
			margin: 0;
			font-weight: 500;
		}
	}

	.nodes {
		h2 {
			margin: 0 0 1rem;
			font-size: 1rem;
		}

		ul {
			list-style: none;
			padding: 0;
			margin: 0;
		}

		li {
			display: flex;
			gap: 1rem;
			padding: 0.5rem 0;
			border-bottom: 1px solid #eee;
		}

		.location {
			flex: 1;
		}

		.timezone {
			color: #666;
			font-size: 0.875rem;
		}

		.date {
			color: #999;
			font-size: 0.875rem;
		}
	}
</style>
