<script lang="ts">
	import type { AudioMedia } from '$lib/types';

	interface Props {
		item: AudioMedia;
	}

	let { item }: Props = $props();
</script>

{#if item.file?.asset?.url}
	<figure>
		<audio controls>
			<source src={item.file.asset.url} />
		</audio>
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

	audio {
		width: 100%;
		max-width: 500px;
	}

	figcaption {
		margin-top: var(--spacing-sm);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}
</style>
