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

{#if data.meetingPoint}
	<section class="meeting-point">
		<h2>Best Meeting Point</h2>
		<p class="coordinates">
			{data.meetingPoint.point.lat.toFixed(4)}, {data.meetingPoint.point.lng.toFixed(4)}
		</p>
		<dl>
			<dt>Total distance</dt>
			<dd>{data.meetingPoint.totalDistanceKm.toLocaleString()} km</dd>
			<dt>Average distance</dt>
			<dd>{data.meetingPoint.averageDistanceKm.toLocaleString()} km</dd>
			<dt>Members</dt>
			<dd>{data.meetingPoint.nodeCount}</dd>
		</dl>
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

	.meeting-point {
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f0f0f0;
		border-radius: 4px;

		h2 {
			margin: 0 0 0.5rem;
			font-size: 1rem;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		.coordinates {
			font-size: 1.25rem;
			font-weight: bold;
			margin: 0 0 1rem;
		}

		dl {
			display: grid;
			grid-template-columns: auto 1fr;
			gap: 0.25rem 1rem;
			margin: 0;
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
