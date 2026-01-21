<script lang="ts">
	import ProjectListing from '$lib/components/Project/ProjectListing.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<ProjectListing projects={data.projects} />
