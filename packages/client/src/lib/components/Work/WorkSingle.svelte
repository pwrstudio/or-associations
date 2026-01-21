<script lang="ts">
	import { urlFor } from '$lib/modules/sanity';
	import type { ExpandedWork } from '$lib/types';

	let { work }: { work: ExpandedWork } = $props();
</script>

<article>
	<h1>{work.title}</h1>

	{#if work.year}
		<p class="year">{work.year}</p>
	{/if}

	{#if work.artists && work.artists.length > 0}
		<p class="artists">
			{#each work.artists as artist, i}
				<a href="/artists/{artist.slug?.current}">{artist.name}</a>{i < work.artists.length - 1
					? ', '
					: ''}
			{/each}
		</p>
	{/if}

	{#if work.medium}
		<p class="medium">{work.medium}</p>
	{/if}

	{#if work.description}
		<p class="description">{work.description}</p>
	{/if}

	{#if work.media && work.media.length > 0}
		<div class="media">
			{#each work.media as item}
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
	.media {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}
</style>
