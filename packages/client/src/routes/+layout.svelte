<script lang="ts">
	let { children } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/artists">Artists</a>
	<a href="/works">Works</a>
	<a href="/projects">Projects</a>
	<a href="/pages">Pages</a>
</nav>

<main>
	{@render children()}
</main>

<style lang="scss">
	nav {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid #ccc;
	}

	nav a {
		text-decoration: none;
		color: inherit;
	}

	nav a:hover {
		text-decoration: underline;
	}

	main {
		padding: 1rem;
	}
</style>
