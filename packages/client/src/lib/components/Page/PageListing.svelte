<script lang="ts">
	import type { ExpandedPage } from '$lib/types';

	let { pages }: { pages: ExpandedPage[] } = $props();
</script>

<div class="page-listing">
	{#if pages && pages.length > 0}
		<ul>
			{#each pages as page}
				<li>
					<a href="/editorial/{page.slug?.current}">{page.title}</a>
				</li>
			{/each}
		</ul>
	{:else}
		No pages found
	{/if}
</div>

<style lang="scss">
	.page-listing {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		font-size: 2em;
		// text-align: center;
	}
</style>
