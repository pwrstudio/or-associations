<script lang="ts">
	import type { ExpandedWork } from '$lib/types';

	let { works }: { works: ExpandedWork[] } = $props();
</script>

<div class="work-listing">
	{#if works && works.length > 0}
		<ul>
			{#each works as work}
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
		No works found
	{/if}
</div>

<style lang="scss">
	.work-listing {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		font-size: 4em;
		text-align: center;
	}
</style>
