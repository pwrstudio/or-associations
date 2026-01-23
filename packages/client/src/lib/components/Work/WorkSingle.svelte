<script lang="ts">
	import { MediaSlideshow } from '$lib/components/MediaSlideshow';
	import type { ExpandedWork } from '$lib/types';

	let { work }: { work: ExpandedWork } = $props();

	let showDetails = $state(false);

	function toggleDetails() {
		showDetails = !showDetails;
	}
</script>

<div class="work-view">
	{#if work.media && work.media.length > 0}
		<div class="slideshow-container">
			<MediaSlideshow media={work.media} />
		</div>
	{/if}

	<div class="info-wrapper">
		<button class="info-bar" onclick={toggleDetails}>
			<span class="title">{work.title}</span>
			{#if work.year}
				<span class="year">{work.year}</span>
			{/if}
			{#if work.artists && work.artists.length > 0}
				<span class="artists">
					{work.artists.map((a) => a.name).join(', ')}
				</span>
			{/if}
		</button>

		{#if showDetails}
			<div class="dropdown">
				{#if work.medium}
					<p class="medium">{work.medium}</p>
				{/if}
				{#if work.description}
					<p class="description">{work.description}</p>
				{/if}
				{#if work.artists && work.artists.length > 0}
					<p class="artists-links">
						{#each work.artists as artist, i}
							<a href="/artists/{artist.slug?.current}">{artist.name}</a>{i <
							work.artists.length - 1
								? ', '
								: ''}
						{/each}
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.work-view {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
	}

	.slideshow-container {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.info-wrapper {
		position: fixed;
		top: var(--spacing-md, 1rem);
		right: var(--spacing-md, 1rem);
		z-index: 10;
		text-align: right;
	}

	.info-bar {
		display: inline-flex;
		gap: 0.5em;
		padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
		background: var(--color-bg, #fff);
		color: var(--color-text, #000);
		border: none;
		cursor: pointer;
		font-size: var(--font-size-sm, 0.875rem);

		&:hover {
			opacity: 0.8;
		}

		.year::before {
			content: '(';
		}
		.year::after {
			content: ')';
		}

		.artists::before {
			content: '— ';
		}
	}

	.dropdown {
		margin-top: var(--spacing-xs, 0.25rem);
		padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
		background: var(--color-bg, #fff);
		color: var(--color-text, #000);
		text-align: left;
		max-width: 300px;
		margin-left: auto;

		p {
			margin: 0 0 var(--spacing-xs, 0.25rem);

			&:last-child {
				margin-bottom: 0;
			}
		}

		.medium {
			font-style: italic;
			opacity: 0.7;
		}

		.description {
			line-height: 1.5;
		}

		.artists-links a {
			color: inherit;
		}
	}
</style>
