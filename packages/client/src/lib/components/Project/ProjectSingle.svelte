<script lang="ts">
	import { MediaSlideshow } from '$lib/components/MediaSlideshow';
	import type { ExpandedProject } from '$lib/types';

	let { project }: { project: ExpandedProject } = $props();

	function formatDate(dateStr: string | null | undefined) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<article>
	<h1>{project.title}</h1>

	{#if project.category}
		<p class="category">{project.category}</p>
	{/if}

	{#if project.artists && project.artists.length > 0}
		<p class="artists">
			{#each project.artists as artist, i}
				<a href="/artists/{artist.slug?.current}">{artist.name}</a>{i < project.artists.length - 1
					? ', '
					: ''}
			{/each}
		</p>
	{/if}

	{#if project.location}
		<p class="location">{project.location}</p>
	{/if}

	{#if project.dateStart}
		<p class="date">
			{formatDate(project.dateStart)}
			{#if project.dateEnd}
				– {formatDate(project.dateEnd)}
			{/if}
			{#if project.time}
				, {project.time}
			{/if}
		</p>
	{/if}

	{#if project.description}
		<div class="description">
			{#each project.description as block}
				{#if block._type === 'block'}
					<p>{block.children?.map((c) => c.text).join('')}</p>
				{/if}
			{/each}
		</div>
	{/if}

	{#if project.slideshow && project.slideshow.length > 0}
		<div class="slideshow">
			<h2>Slideshow</h2>
			<MediaSlideshow media={project.slideshow} />
		</div>
	{/if}

	{#if project.media && project.media.length > 0}
		<div class="media">
			<h2>Media</h2>
			<MediaSlideshow media={project.media} />
		</div>
	{/if}

	{#if project.works && project.works.length > 0}
		<div class="works">
			<h2>Related Works</h2>
			<ul>
				{#each project.works as work}
					<li>
						<a href="/works/{work.slug?.current}">{work.title}</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</article>

<style lang="scss">
	article {
		width: 70ch;
		max-width: 100%;
	}
	.slideshow,
	.media {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}

	.description {
		max-width: 100%;
	}
</style>
