<script lang="ts">
	import type { ExpandedArtist } from '$lib/types';

	let { artists }: { artists: ExpandedArtist[] } = $props();
</script>

<div class="artist-listing">
	{#if artists && artists.length > 0}
		<ul>
			{#each artists as artist}
				<li>
					<a href="/artists/{artist.slug?.current}">{artist.name}</a>
				</li>
			{/each}
		</ul>
	{:else}
		No artists found
	{/if}
</div>

<style lang="scss">
	.artist-listing {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		font-size: 2em;
		// text-align: center;
	}
</style>
