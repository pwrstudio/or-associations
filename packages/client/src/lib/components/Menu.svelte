<script lang="ts">
	import TestLogo from './graphics/TestLogo.svelte';

	const menuItems = [
		{ href: '/', label: 'Home' },
		{ href: '/artists', label: 'Artists' },
		{ href: '/works', label: 'Works' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/pages', label: 'Pages' }
	];
</script>

<nav class="menu">
	<div class="menu-items">
		{#each menuItems as item}
			<a href={item.href}>{item.label}</a>
		{/each}
	</div>
	<div class="menu-trigger">
		<!-- <TestLogo /> -->
	</div>
</nav>

<style lang="scss">
	.menu {
		position: fixed;
		bottom: var(--menu-position-bottom);
		left: var(--menu-position-left);
		z-index: var(--z-index-menu);

		&:hover .menu-items {
			opacity: 1;
			visibility: visible;
			transform: translateY(0);
		}
	}

	.menu-trigger {
		width: var(--menu-trigger-size);
		height: var(--menu-trigger-size);
		border-radius: 50%;
		// background-color: var(--color-foreground);
		border: 2px solid var(--color-foreground);
		cursor: pointer;
		transition: transform var(--transition-duration) var(--transition-easing);

		&:hover {
			transform: scale(1.1);
		}
	}

	.menu-items {
		position: absolute;
		bottom: 100%;
		width: var(--menu-trigger-size);
		text-align: center;
		z-index: 100;
		left: 0;
		display: flex;
		flex-direction: column;
		opacity: 0;
		visibility: hidden;
		margin-bottom: 1em;
		transform: translateY(10px);
		transition:
			opacity var(--transition-duration) var(--transition-easing),
			visibility var(--transition-duration) var(--transition-easing),
			transform var(--transition-duration) var(--transition-easing);
		user-select: none;

		a {
			text-decoration: none;
			color: var(--color-text);
			white-space: nowrap;
			font-size: 4em;
			padding: 0;
			margin: 0;
			line-height: 1.1em;
			mix-blend-mode: difference;

			&:hover {
				text-decoration: underline;
				mix-blend-mode: unset;
			}
		}
	}
</style>
