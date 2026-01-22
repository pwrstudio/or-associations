<script lang="ts">
	import type { VideoMedia } from '$lib/types';

	interface Props {
		item: VideoMedia;
	}

	let { item }: Props = $props();
</script>

{#if item.file?.asset?.url}
	<figure>
		<video controls>
			<source src={item.file.asset.url} />
		</video>
		{#if item.caption}
			<figcaption>{item.caption}</figcaption>
		{/if}
	</figure>
{/if}

<style lang="scss">
	figure {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0;
		width: 100%;
		height: 100%;
	}

	video {
		max-width: 100%;
		max-height: 100%;
	}

	figcaption {
		position: absolute;
		bottom: var(--spacing-md, 1rem);
		left: var(--spacing-md, 1rem);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}
</style>
