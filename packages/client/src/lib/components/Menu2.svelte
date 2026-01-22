<script lang="ts">
	const menuItems = [
		{ href: '/', label: 'Home', size: 100 },
		{ href: '/artists', label: 'Artists', size: 120 },
		{ href: '/works', label: 'Works', size: 110 },
		{ href: '/projects', label: 'Projects', size: 130 },
		{ href: '/pages', label: 'Pages', size: 110 }
	];

	const orbitRadius = 200;
	const triggerRadius = 75; // Half of --menu-trigger-size (150px)

	let isOpen = $state(false);

	function getItemPosition(index: number, total: number) {
		const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
		return {
			angle,
			x: Math.cos(angle) * orbitRadius,
			y: Math.sin(angle) * orbitRadius
		};
	}

	function getLineCoords(index: number, total: number, itemRadius: number) {
		const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
		// Line starts at edge of trigger circle
		const startX = Math.cos(angle) * triggerRadius;
		const startY = Math.sin(angle) * triggerRadius;
		// Line ends at edge of item circle
		const endX = Math.cos(angle) * (orbitRadius - itemRadius);
		const endY = Math.sin(angle) * (orbitRadius - itemRadius);
		return { startX, startY, endX, endY };
	}

	function handleTriggerTouch(e: TouchEvent) {
		e.preventDefault();
		isOpen = !isOpen;
	}

	function handleContentLeave() {
		isOpen = false;
	}

	function handleTriggerEnter() {
		isOpen = true;
	}
</script>

<nav class="menu2" class:is-open={isOpen}>
	<div
		class="menu-content"
		onmouseleave={handleContentLeave}
		role="region"
		aria-label="Menu content"
	>
		<svg class="lines" viewBox="-300 -300 600 600">
			{#each menuItems as item, index}
				{@const line = getLineCoords(index, menuItems.length, item.size / 2)}
				<line
					x1={line.startX}
					y1={line.startY}
					x2={line.endX}
					y2={line.endY}
					style="--delay: {index * 40 + 150}ms"
				/>
			{/each}
		</svg>

		{#each menuItems as item, index}
			{@const pos = getItemPosition(index, menuItems.length)}
			<a
				href={item.href}
				class="menu-item"
				style="--x: {pos.x}px; --y: {pos.y}px; --size: {item.size}px; --delay: {index * 40}ms"
				onclick={() => (isOpen = false)}
			>
				<span>{item.label}</span>
			</a>
		{/each}

		<button
			class="menu-trigger"
			onmouseenter={handleTriggerEnter}
			ontouchstart={handleTriggerTouch}
		>
			<span>or</span>
		</button>
	</div>
</nav>

<style lang="scss">
	.menu2 {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: var(--z-index-menu);
		user-select: none;

		&.is-open {
			.menu-content {
				width: 600px;
				height: 600px;
			}

			.menu-trigger {
				transform: translate(-50%, -50%) scale(1.05);
			}

			.menu-item {
				opacity: 1;
				transform: translate(calc(var(--x) - var(--size) / 2), calc(var(--y) - var(--size) / 2));
			}

			.lines line {
				opacity: 1;
			}
		}
	}

	.menu-content {
		position: relative;
		width: var(--menu-trigger-size);
		height: var(--menu-trigger-size);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.lines {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 600px;
		height: 600px;
		pointer-events: none;

		line {
			stroke: var(--color-foreground);
			stroke-width: 2;
			opacity: 0;
			transition: opacity 0.15s ease var(--delay);
		}
	}

	.menu-trigger {
		width: var(--menu-trigger-size);
		height: var(--menu-trigger-size);
		border-radius: 50%;
		border: 2px solid var(--color-foreground);
		background: transparent;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s ease;

		span {
			font-size: 1em;
			color: var(--color-text);
		}
	}

	.menu-item {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		border: 2px solid var(--color-foreground);
		text-decoration: none;
		color: var(--color-text);
		font-size: 1em;
		opacity: 0;
		transform: translate(-50%, -50%);
		transition:
			opacity 0.15s ease var(--delay),
			transform 0.2s ease var(--delay);

		&:hover {
			transform: translate(calc(var(--x) - var(--size) / 2), calc(var(--y) - var(--size) / 2))
				scale(1.1);
			text-decoration: none;
		}

		span {
			text-align: center;
		}
	}
</style>
