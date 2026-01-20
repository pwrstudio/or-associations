<script lang="ts">
	import { urlFor } from '$lib/modules/sanity';
	import Metadata from '$lib/components/Metadata.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="artist" artist={data.artist} />

<article>
	<h1>{data.artist.name}</h1>

	{#if data.artist.profileImage}
		<img src={urlFor(data.artist.profileImage).width(400).url()} alt={data.artist.name} />
	{/if}

	{#if data.artist.bio}
		<div class="bio">
			{#each data.artist.bio as block}
				{#if block._type === 'block'}
					<p>{block.children?.map((c) => c.text).join('')}</p>
				{/if}
			{/each}
		</div>
	{/if}
</article>

<style lang="scss">
	img {
		max-width: 100%;
		height: auto;
	}
</style>
