<script lang="ts">
	import '$lib/modules/styles/global.scss';
	import { ForceMenu } from '$lib/components/ForceMenu';
	import NodeInfo from '$lib/components/NodeInfo.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const menuItems = [
		{ id: 'home', label: 'Home', href: '/', radius: 50 },
		{ id: 'artists', label: 'Artists', href: '/artists', radius: 55 },
		{ id: 'works', label: 'Works', href: '/works', radius: 50 },
		{ id: 'projects', label: 'Projects', href: '/projects', radius: 60 },
		{ id: 'editorial', label: 'Editorial', href: '/editorial', radius: 65 }
	];
</script>

<ForceMenu items={menuItems} centerLabel="or" />
<NodeInfo nodes={data.nodes} centroid={data.centroid} />

<main>
	{@render children()}
</main>

<style lang="scss">
	main {
		padding: var(--spacing-lg);
	}
</style>
