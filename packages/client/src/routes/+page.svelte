<script lang="ts">
	import Metadata from '$lib/components/Metadata.svelte';
	import Home from '$lib/components/Home.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="landing" />
<Home nodes={data.nodes} median={data.median} centroid={data.centroid} nodeCount={data.nodeCount} />
