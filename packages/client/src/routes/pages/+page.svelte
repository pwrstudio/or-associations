<script lang="ts">
	import PageListing from '$lib/components/Page/PageListing.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageListing pages={data.pages} />
