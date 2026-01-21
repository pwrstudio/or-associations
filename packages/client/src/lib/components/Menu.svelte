<script lang="ts">
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
	<div class="menu-trigger"></div>
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
		background-color: var(--color-foreground);
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
		left: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding-bottom: var(--spacing-lg);
		opacity: 0;
		visibility: hidden;
		transform: translateY(10px);
		transition:
			opacity var(--transition-duration) var(--transition-easing),
			visibility var(--transition-duration) var(--transition-easing),
			transform var(--transition-duration) var(--transition-easing);

		a {
			text-decoration: none;
			color: var(--color-text);
			white-space: nowrap;

			&:hover {
				text-decoration: underline;
			}
		}
	}
</style>
