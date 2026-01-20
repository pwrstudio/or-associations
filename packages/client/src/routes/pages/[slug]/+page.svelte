<script lang="ts">
	import Metadata from '$lib/components/Metadata.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="page" page={data.page} />

<article>
	<h1>{data.page.title}</h1>

	{#if data.page.artists && data.page.artists.length > 0}
		<p class="artists">
			{#each data.page.artists as artist, i}
				<a href="/artists/{artist.slug?.current}">{artist.name}</a>{i < data.page.artists.length - 1
					? ', '
					: ''}
			{/each}
		</p>
	{/if}

	{#if data.page.content}
		<div class="content">
			{#each data.page.content as block}
				{#if block._type === 'block'}
					<p>{block.children?.map((c) => c.text).join('')}</p>
				{/if}
			{/each}
		</div>
	{/if}
</article>
