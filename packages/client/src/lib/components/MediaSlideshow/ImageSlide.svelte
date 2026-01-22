<script lang="ts">
	import { urlFor } from '$lib/modules/sanity';
	import type { ImageMedia } from '$lib/types';

	interface Props {
		item: ImageMedia;
	}

	let { item }: Props = $props();
</script>

{#if item.image}
	<figure>
		<img src={urlFor(item.image).width(1200).url()} alt={item.caption || ''} />
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

	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	figcaption {
		position: absolute;
		bottom: var(--spacing-md, 1rem);
		left: var(--spacing-md, 1rem);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}
</style>
