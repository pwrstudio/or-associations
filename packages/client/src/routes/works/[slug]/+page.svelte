<script lang="ts">
	import Metadata from '$lib/components/Metadata.svelte';
	import WorkSingle from '$lib/components/Work/WorkSingle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="work" work={data.work} />
<WorkSingle work={data.work} />
