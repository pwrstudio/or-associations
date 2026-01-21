<script lang="ts">
	import type { ExpandedPage } from '$lib/types';

	let { page }: { page: ExpandedPage } = $props();
</script>

<article>
	<h1>{page.title}</h1>

	{#if page.artists && page.artists.length > 0}
		<p class="artists">
			{#each page.artists as artist, i}
				<a href="/artists/{artist.slug?.current}">{artist.name}</a>{i < page.artists.length - 1
					? ', '
					: ''}
			{/each}
		</p>
	{/if}

	{#if page.content}
		<div class="content">
			{#each page.content as block}
				{#if block._type === 'block'}
					<p>{block.children?.map((c) => c.text).join('')}</p>
				{/if}
			{/each}
		</div>
	{/if}
</article>
