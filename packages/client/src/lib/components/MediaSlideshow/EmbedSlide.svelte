<script lang="ts">
	import type { EmbedMedia } from '$lib/types';

	interface Props {
		item: EmbedMedia;
	}

	let { item }: Props = $props();
</script>

{#if item.url}
	<figure>
		<a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
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
		margin: 0;
		width: 100%;
		padding: 0 var(--spacing-md);
	}

	a {
		word-break: break-all;
	}

	figcaption {
		margin-top: var(--spacing-sm);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}
</style>
