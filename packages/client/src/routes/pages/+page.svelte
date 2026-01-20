<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1>Pages</h1>

{#if data.pages && data.pages.length > 0}
	<ul>
		{#each data.pages as page}
			<li>
				<a href="/pages/{page.slug?.current}">{page.title}</a>
			</li>
		{/each}
	</ul>
{:else}
	<p>No pages found.</p>
{/if}
