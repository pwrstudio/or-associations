<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>Check In</title>
</svelte:head>

<main>
	{@render children()}
</main>

<style lang="scss">
	:global(body) {
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		margin: 0;
		padding: 0;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f5f5;
	}

	main {
		text-align: center;
		padding: 2rem;
	}
</style>
