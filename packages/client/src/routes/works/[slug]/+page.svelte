<script lang="ts">
	import { urlFor } from '$lib/modules/sanity';
	import Metadata from '$lib/components/Metadata.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="work" work={data.work} />

<article>
	<h1>{data.work.title}</h1>

	{#if data.work.year}
		<p class="year">{data.work.year}</p>
	{/if}

	{#if data.work.artists && data.work.artists.length > 0}
		<p class="artists">
			{#each data.work.artists as artist, i}
				<a href="/artists/{artist.slug?.current}">{artist.name}</a>{i < data.work.artists.length - 1
					? ', '
					: ''}
			{/each}
		</p>
	{/if}

	{#if data.work.medium}
		<p class="medium">{data.work.medium}</p>
	{/if}

	{#if data.work.description}
		<p class="description">{data.work.description}</p>
	{/if}

	{#if data.work.media && data.work.media.length > 0}
		<div class="media">
			{#each data.work.media as item}
				{#if item._type === 'imageMedia' && item.image}
					<figure>
						<img src={urlFor(item.image).width(800).url()} alt={item.caption || ''} />
						{#if item.caption}
							<figcaption>{item.caption}</figcaption>
						{/if}
					</figure>
				{:else if item._type === 'videoMedia' && item.file?.asset}
					<figure>
						<video controls>
							<source src={item.file.asset.url} />
						</video>
						{#if item.caption}
							<figcaption>{item.caption}</figcaption>
						{/if}
					</figure>
				{:else if item._type === 'audioMedia' && item.file?.asset}
					<figure>
						<audio controls>
							<source src={item.file.asset.url} />
						</audio>
						{#if item.caption}
							<figcaption>{item.caption}</figcaption>
						{/if}
					</figure>
				{:else if item._type === 'embedMedia' && item.url}
					<figure>
						<a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
						{#if item.caption}
							<figcaption>{item.caption}</figcaption>
						{/if}
					</figure>
				{/if}
			{/each}
		</div>
	{/if}
</article>

<style lang="scss">
	img,
	video {
		max-width: 100%;
		height: auto;
	}

	.media {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}

	figure {
		margin: 0;
	}

	figcaption {
		font-size: 0.9em;
		opacity: 0.7;
		margin-top: 0.5rem;
	}
</style>
