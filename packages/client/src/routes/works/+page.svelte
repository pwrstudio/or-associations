<script lang="ts">
	import WorkListing from '$lib/components/Work/WorkListing.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<WorkListing works={data.works} />
