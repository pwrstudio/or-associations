<script lang="ts">
	import Metadata from '$lib/components/Metadata.svelte';
	import ProjectSingle from '$lib/components/Project/ProjectSingle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="project" project={data.project} />
<ProjectSingle project={data.project} />
