<script lang="ts">
	import '$lib/modules/styles/global.scss';
	import { page } from '$app/state';
	import { ForceMenu } from '$lib/components/ForceMenu';
	import { DotPattern } from '$lib/components/DotPattern';
	import NodeInfo from '$lib/components/NodeInfo.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const menuItems = [
		{ id: 'artists', label: 'Artists', href: '/artists', radius: 55 },
		{ id: 'works', label: 'Works', href: '/works', radius: 50 },
		{ id: 'projects', label: 'Projects', href: '/projects', radius: 60 },
		{ id: 'editorial', label: 'Editorial', href: '/editorial', radius: 65 },
		{ id: 'about', label: 'About', href: '/about', radius: 50 }
	];

	// Check if on single work page (exclude from two-column layout)
	const isSingleWorkPage = $derived(page.url.pathname.match(/^\/works\/[^/]+$/));

	// Check if on landing page
	const isLandingPage = $derived(page.url.pathname === '/');

	// Show dot pattern on landing and listing pages
	const showDotPattern = $derived(
		isLandingPage ||
			page.url.pathname === '/artists' ||
			page.url.pathname === '/works' ||
			page.url.pathname === '/projects' ||
			page.url.pathname === '/editorial'
	);
</script>

<NodeInfo nodes={data.nodes} centroid={data.centroid} />
<ForceMenu items={menuItems} centerLabel="or" initialLeft={25} />

{#if isSingleWorkPage}
	<main class="single-work">
		{@render children()}
	</main>
{:else}
	<div class="two-column-layout">
		<div class="column left">
			{#if showDotPattern}
				<DotPattern color="#333333" size={0} spacing={10} />
			{/if}
		</div>
		<div class="column right">
			<main class:landing={isLandingPage}>
				{@render children()}
			</main>
		</div>
	</div>
{/if}

<style lang="scss">
	.two-column-layout {
		display: flex;
		flex-direction: row;
		height: 100dvh;
		width: 100dvw;
		position: fixed;
		top: 0;
		left: 0;
	}

	.column {
		flex: 1;
		height: 100%;
		width: 50%;
		position: relative;
	}

	.column.right {
		overflow-y: auto;
	}

	main {
		padding: var(--spacing-lg);
		height: 100%;
		position: relative;
	}

	main.landing {
		padding: 0;
	}

	main.single-work {
		padding: var(--spacing-lg);
	}
</style>
