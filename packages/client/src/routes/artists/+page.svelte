<script lang="ts">
	import ArtistListing from '$lib/components/Artist/ArtistListing.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<ArtistListing artists={data.artists} />
