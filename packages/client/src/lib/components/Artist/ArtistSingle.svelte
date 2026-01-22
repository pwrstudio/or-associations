<script lang="ts">
	import { urlFor } from '$lib/modules/sanity';
	import type { ExpandedArtist } from '$lib/types';

	let { artist }: { artist: ExpandedArtist } = $props();
</script>

<article>
	<h1>{artist.name}</h1>

	{#if artist.profileImage}
		<img src={urlFor(artist.profileImage).width(400).url()} alt={artist.name} />
	{/if}

	{#if artist.bio}
		<div class="bio">
			{#each artist.bio as block}
				{#if block._type === 'block'}
					<p>{block.children?.map((c) => c.text).join('')}</p>
				{/if}
			{/each}
		</div>
	{/if}

	{#if artist.works && artist.works.length > 0}
		<section class="related">
			<h2>Works</h2>
			<ul>
				{#each artist.works as work}
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
		</section>
	{/if}

	{#if artist.projects && artist.projects.length > 0}
		<section class="related">
			<h2>Projects</h2>
			<ul>
				{#each artist.projects as project}
					<li>
						<a href="/projects/{project.slug?.current}">
							{project.title}
							{#if project.category}
								<span class="category">({project.category})</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if artist.pages && artist.pages.length > 0}
		<section class="related">
			<h2>Texts</h2>
			<ul>
				{#each artist.pages as page}
					<li>
						<a href="/pages/{page.slug?.current}">{page.title}</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</article>

<style lang="scss">
	article {
		width: 70ch;
		max-width: 95%;
		margin-inline: auto;
		padding-top: 10em;
	}
	.related {
		margin-top: var(--spacing-xl);

		h2 {
			margin: 0 0 var(--spacing-md);
			font-size: var(--font-size-base);
		}
	}

	.year,
	.category {
		opacity: var(--opacity-muted);
	}
</style>
