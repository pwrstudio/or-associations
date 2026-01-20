<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1>Artists</h1>

{#if data.artists && data.artists.length > 0}
	<ul>
		{#each data.artists as artist}
			<li>
				<a href="/artists/{artist.slug?.current}">{artist.name}</a>
			</li>
		{/each}
	</ul>
{:else}
	<p>No artists found.</p>
{/if}
