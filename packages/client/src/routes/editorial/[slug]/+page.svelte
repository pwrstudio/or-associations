<script lang="ts">
	import Metadata from '$lib/components/Metadata.svelte';
	import PageSingle from '$lib/components/Page/PageSingle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="page" page={data.page} />
<PageSingle page={data.page} />
