<script lang="ts">
	import { urlFor } from '$lib/modules/sanity';
	import Metadata from '$lib/components/Metadata.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(dateStr: string | null | undefined) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<Metadata type="project" project={data.project} />

<article>
	<h1>{data.project.title}</h1>

	{#if data.project.category}
		<p class="category">{data.project.category}</p>
	{/if}

	{#if data.project.artists && data.project.artists.length > 0}
		<p class="artists">
			{#each data.project.artists as artist, i}
				<a href="/artists/{artist.slug?.current}">{artist.name}</a>{i <
				data.project.artists.length - 1
					? ', '
					: ''}
			{/each}
		</p>
	{/if}

	{#if data.project.location}
		<p class="location">{data.project.location}</p>
	{/if}

	{#if data.project.dateStart}
		<p class="date">
			{formatDate(data.project.dateStart)}
			{#if data.project.dateEnd}
				– {formatDate(data.project.dateEnd)}
			{/if}
			{#if data.project.time}
				, {data.project.time}
			{/if}
		</p>
	{/if}

	{#if data.project.description}
		<div class="description">
			{#each data.project.description as block}
				{#if block._type === 'block'}
					<p>{block.children?.map((c) => c.text).join('')}</p>
				{/if}
			{/each}
		</div>
	{/if}

	{#if data.project.slideshow && data.project.slideshow.length > 0}
		<div class="slideshow">
			<h2>Slideshow</h2>
			{#each data.project.slideshow as item}
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

	{#if data.project.media && data.project.media.length > 0}
		<div class="media">
			<h2>Media</h2>
			{#each data.project.media as item}
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
				{/if}
			{/each}
		</div>
	{/if}

	{#if data.project.works && data.project.works.length > 0}
		<div class="works">
			<h2>Related Works</h2>
			<ul>
				{#each data.project.works as work}
					<li>
						<a href="/works/{work.slug?.current}">{work.title}</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</article>

<style lang="scss">
	img,
	video {
		max-width: 100%;
		height: auto;
	}

	.slideshow,
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
