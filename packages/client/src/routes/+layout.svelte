<script lang="ts">
	import '$lib/modules/styles/global.scss';
	import Menu from '$lib/components/Menu.svelte';

	let { children } = $props();
</script>

<Menu />

<main>
	{@render children()}
</main>

<style lang="scss">
	main {
		padding: var(--spacing-lg);
	}
</style>
