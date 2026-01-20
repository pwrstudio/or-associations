<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1>Works</h1>

{#if data.works && data.works.length > 0}
	<ul>
		{#each data.works as work}
			<li>
				<a href="/works/{work.slug?.current}">
					{work.title}
					{#if work.year}
						<span class="year">({work.year})</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<p>No works found.</p>
{/if}

<style lang="scss">
	.year {
		opacity: 0.7;
	}
</style>
