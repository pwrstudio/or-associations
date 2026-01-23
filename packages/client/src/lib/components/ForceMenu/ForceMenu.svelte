<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		createSimulation,
		enablePerformanceLogging,
		type Simulation,
		type RenderState,
		type ForceNode as ForceNodeData,
		type PhysicsConfig
	} from '$lib/modules/force';
	import ForceNodeComponent from './ForceNode.svelte';
	import ForceEdgeComponent from './ForceEdge.svelte';

	interface MenuItem {
		id: string;
		label: string;
		href: string;
		radius?: number;
	}

	interface Props {
		items: MenuItem[];
		centerLabel?: string;
		centerRadius?: number;
		itemRadius?: number;
		width?: number;
		height?: number;
		linkDistance?: number;
		debug?: boolean;
		physics?: PhysicsConfig;
	}

	// Default physics configuration
	const defaultPhysics: Required<PhysicsConfig> = {
		alpha: 0.3,
		alphaDecay: 0.03,
		velocityDecay: 0.3,
		centerStrength: 0.08,
		repelStrength: -100,
		repelDistanceMin: 10,
		repelDistanceMax: 400,
		linkStrength: 0.4,
		collisionStrength: 1.5,
		collisionPadding: 30,
		radialPadding: 70,
		radialStrength: 1.0,
		drawDuration: 350,
		drawStagger: 40,
		retractDuration: 250,
		retractStagger: 20,
		openJitter: 30
	};

	let {
		items,
		centerLabel = 'or',
		centerRadius = 75,
		itemRadius = 55,
		width = 600,
		height = 600,
		linkDistance = 180,
		debug = false,
		physics = {}
	}: Props = $props();

	// Merge user physics with defaults
	const p = $derived({ ...defaultPhysics, ...physics });

	let simulation: Simulation | null = $state(null);
	let renderState: RenderState | null = $state(null);
	let isOpen = $state(false);
	let svgElement: SVGSVGElement | null = $state(null);
	let hasDragged = $state(false);

	const cx = $derived(width / 2);
	const cy = $derived(height / 2);

	onMount(() => {
		if (debug) {
			enablePerformanceLogging(true);
			console.log('[ForceMenu] Physics config:', p);
		}

		// Create simulation
		simulation = createSimulation({
			width,
			height,
			alpha: p.alpha,
			alphaDecay: p.alphaDecay,
			velocityDecay: p.velocityDecay
		});

		const unsub = simulation.subscribe((state) => {
			renderState = state;
		});

		// Add center node (fixed)
		simulation.addNode({
			id: 'center',
			x: cx,
			y: cy,
			radius: centerRadius,
			mass: 10,
			fixed: true,
			data: { label: centerLabel, isCenter: true }
		});

		// Add menu item nodes
		items.forEach((item, i) => {
			const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2;
			const radius = item.radius || itemRadius;

			simulation!.addNode({
				id: item.id,
				x: cx + Math.cos(angle) * linkDistance,
				y: cy + Math.sin(angle) * linkDistance,
				radius,
				mass: 1,
				fixed: false,
				data: { label: item.label, href: item.href }
			});

			simulation!.addEdge({
				id: `edge-${item.id}`,
				source: 'center',
				target: item.id,
				strength: 1
			});
		});

		// Configure forces (now built-in to simulation)
		simulation.setForceConfig({
			centerX: cx,
			centerY: cy,
			centerStrength: p.centerStrength,
			repelStrength: p.repelStrength,
			repelDistanceMin2: p.repelDistanceMin * p.repelDistanceMin,
			repelDistanceMax2: p.repelDistanceMax * p.repelDistanceMax,
			linkDistance,
			linkStrength: p.linkStrength,
			collisionStrength: p.collisionStrength,
			collisionPadding: p.collisionPadding,
			radialMinDistance: centerRadius + p.radialPadding,
			radialStrength: p.radialStrength
		});

		return () => {
			unsub();
			simulation?.destroy();
		};
	});

	function handleToggle() {
		if (isOpen) {
			handleClose();
		} else {
			handleOpen();
		}
	}

	function handleOpen() {
		if (isOpen) return;
		isOpen = true;

		// Apply jitter to node positions for organic movement on open
		if (p.openJitter > 0 && simulation) {
			items.forEach((item) => {
				const node = simulation!.getNode(item.id);
				if (node && !node.fixed) {
					const jitterX = (Math.random() - 0.5) * 2 * p.openJitter;
					const jitterY = (Math.random() - 0.5) * 2 * p.openJitter;
					simulation!.dragMove(item.id, node.x + jitterX, node.y + jitterY);
				}
			});
		}

		simulation?.start();
		simulation?.reheat(p.alpha);

		const edgeIds = items.map((item) => `edge-${item.id}`);
		simulation?.animateEdges(edgeIds, {
			duration: p.drawDuration,
			stagger: p.drawStagger
		});
	}

	function handleClose() {
		if (!isOpen) return;
		isOpen = false;

		const edgeIds = items.map((item) => `edge-${item.id}`);
		simulation?.animateEdges(edgeIds, {
			duration: p.retractDuration,
			stagger: p.retractStagger,
			direction: 'retract'
		});

		setTimeout(
			() => {
				if (!isOpen) {
					simulation?.stop();
				}
			},
			p.retractDuration + p.retractStagger * items.length
		);
	}

	function handleItemClick(href: string) {
		handleClose();
		setTimeout(() => {
			goto(href);
		}, 100);
	}

	function handleCenterClick() {
		if (!hasDragged) {
			handleToggle();
		}
		hasDragged = false;
	}

	function handleCenterDragStart() {
		hasDragged = false;
		simulation?.dragStart('center');
	}

	function handleCenterDragMove(x: number, y: number) {
		hasDragged = true;
		const padding = centerRadius;
		const viewportW = window.innerWidth;
		const viewportH = window.innerHeight;
		const minX = cx - viewportW / 2 + padding;
		const maxX = cx + viewportW / 2 - padding;
		const minY = cy - viewportH / 2 + padding;
		const maxY = cy + viewportH / 2 - padding;
		const clampedX = Math.max(minX, Math.min(maxX, x));
		const clampedY = Math.max(minY, Math.min(maxY, y));
		simulation?.dragMove('center', clampedX, clampedY);
	}

	function handleCenterDragEnd() {
		simulation?.dragEnd('center');
	}

	function isCenter(node: ForceNodeData): boolean {
		return node.data?.isCenter === true;
	}
</script>

<nav class="force-menu" class:is-open={isOpen} aria-label="Main menu">
	<div class="menu-content">
		<svg
			bind:this={svgElement}
			viewBox="0 0 {width} {height}"
			{width}
			{height}
			class:is-open={isOpen}
		>
			{#if isOpen && renderState}
				{#each renderState.edges as edge (edge.id)}
					<ForceEdgeComponent
						path={edge.geometry.path}
						dashArray={edge.dashArray}
						dashOffset={edge.dashOffset}
					/>
				{/each}
			{/if}

			{#if renderState}
				{#each renderState.nodes as node (node.id)}
					{@const nodeIsCenter = isCenter(node)}
					{@const href = node.data?.href as string}
					{#if nodeIsCenter || isOpen}
						<ForceNodeComponent
							x={node.x}
							y={node.y}
							radius={node.radius}
							label={node.data?.label as string}
							{href}
							isCenter={nodeIsCenter}
							visible={true}
							draggable={nodeIsCenter}
							{svgElement}
							onDragStart={nodeIsCenter ? handleCenterDragStart : undefined}
							onDragMove={nodeIsCenter ? handleCenterDragMove : undefined}
							onDragEnd={nodeIsCenter ? handleCenterDragEnd : undefined}
							onClick={nodeIsCenter
								? handleCenterClick
								: href
									? () => handleItemClick(href)
									: undefined}
						/>
					{/if}
				{/each}
			{/if}
		</svg>
	</div>
</nav>

<style>
	.force-menu {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: var(--z-index-menu);
		user-select: none;
		mix-blend-mode: difference;
	}

	.menu-content {
		position: relative;
		width: var(--menu-trigger-size);
		height: var(--menu-trigger-size);
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			width 0.3s ease,
			height 0.3s ease;
	}

	.force-menu.is-open .menu-content {
		width: 600px;
		height: 600px;
	}

	svg {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		overflow: visible;
		pointer-events: none;
	}

	svg.is-open {
		pointer-events: auto;
	}

	svg :global(.force-node) {
		pointer-events: auto;
	}
</style>
