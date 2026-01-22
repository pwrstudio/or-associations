<script lang="ts">
	import '$lib/modules/styles/global.scss';
	import Menu from '$lib/components/Menu.svelte';
	import Menu2 from '$lib/components/Menu2.svelte';
	import NodeInfo from '$lib/components/NodeInfo.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<Menu2 />
<NodeInfo nodes={data.nodes} centroid={data.centroid} />

<main>
	{@render children()}
</main>

<style lang="scss">
	main {
		padding: var(--spacing-lg);
	}
</style>
