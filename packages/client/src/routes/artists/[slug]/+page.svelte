<script lang="ts">
	import Metadata from '$lib/components/Metadata.svelte';
	import ArtistSingle from '$lib/components/Artist/ArtistSingle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="artist" artist={data.artist} />
<ArtistSingle artist={data.artist} />
