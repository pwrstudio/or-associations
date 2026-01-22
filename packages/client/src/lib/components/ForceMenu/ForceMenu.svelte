<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		createSimulation,
		createAnimationController,
		createCenterForce,
		createManyBodyForce,
		createLinkForce,
		createCollisionForce,
		createIdleMovementForce,
		createRadialMinDistanceForce,
		type SimulationState,
		type Simulation,
		type AnimationController,
		type ForceNode as ForceNodeType,
		type ForceEdge as ForceEdgeType
	} from '$lib/modules/force-graph';
	import ForceNode from './ForceNode.svelte';
	import ForceEdge from './ForceEdge.svelte';

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
		width?: number;
		height?: number;
		linkDistance?: number;
	}

	let {
		items,
		centerLabel = 'or',
		centerRadius = 75,
		width = 600,
		height = 600,
		linkDistance = 180
	}: Props = $props();

	let simulation: Simulation | null = $state(null);
	let animController: AnimationController | null = $state(null);
	let simState: SimulationState | null = $state(null);
	let edgeProgress = $state<Map<string, number>>(new Map());
	let isOpen = $state(false);
	let svgElement: SVGSVGElement | null = $state(null);
	let isDragging = $state(false);
	let hasDragged = $state(false);

	// Derived state for rendering
	function getNodes(): ForceNodeType[] {
		return simState ? Array.from(simState.nodes.values()) : [];
	}
	function getEdges(): ForceEdgeType[] {
		return simState ? Array.from(simState.edges.values()) : [];
	}
	let nodes = $derived(getNodes());
	let edges = $derived(getEdges());
	let cx = $derived(width / 2);
	let cy = $derived(height / 2);

	onMount(() => {
		// Create simulation - high damping for stability
		simulation = createSimulation({
			width,
			height,
			alpha: 0.3,
			alphaDecay: 0.05,
			velocityDecay: 0.5
		});

		// Create animation controller
		animController = createAnimationController();

		// Subscribe to simulation updates
		const unsubSim = simulation.subscribe((state) => {
			simState = state;
		});

		// Subscribe to animation updates
		const unsubAnim = animController.subscribe(() => {
			// Update edge progress from animation controller
			const newProgress = new Map<string, number>();
			edges.forEach((edge) => {
				newProgress.set(edge.id, animController!.getProgress(edge.id));
			});
			edgeProgress = newProgress;
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
			const radius = item.radius || 55;

			simulation!.addNode({
				id: item.id,
				x: cx + Math.cos(angle) * linkDistance,
				y: cy + Math.sin(angle) * linkDistance,
				radius,
				mass: 1,
				fixed: false,
				data: { label: item.label, href: item.href }
			});

			// Add edge from center
			simulation!.addEdge({
				id: `edge-${item.id}`,
				source: 'center',
				target: item.id,
				strength: 1
			});
		});

		// Add forces - tuned for stability
		simulation.addForce('center', createCenterForce(cx, cy, 0.1));
		simulation.addForce('repel', createManyBodyForce(-50, 10, 250));
		simulation.addForce('links', createLinkForce(linkDistance, 0.8));
		simulation.addForce(
			'collision',
			createCollisionForce((n) => n.radius, 1, 20)
		);
		// Keep items at minimum distance from center
		const minDistFromCenter = centerRadius + 60; // center radius + item radius + padding
		simulation.addForce('radial', createRadialMinDistanceForce(cx, cy, minDistFromCenter, 1));
		// Very subtle idle movement
		simulation.addForce('idle', createIdleMovementForce(0.001, 0.2, 0.0002));

		// Don't start simulation - only run when menu is open
		// simulation.start();

		return () => {
			unsubSim();
			unsubAnim();
			simulation?.destroy();
			animController?.destroy();
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

		// Start simulation and animate lines
		simulation?.start();
		simulation?.reheat(0.3);

		const edgeIds = edges.map((e) => e.id);
		animController?.drawSequence(edgeIds, {
			duration: 350,
			stagger: 40
		});
	}

	function handleClose() {
		if (!isOpen) return;
		isOpen = false;

		// Retract lines
		animController?.retractAll({
			duration: 250,
			stagger: 20
		});

		// Stop simulation after animation completes
		setTimeout(() => {
			if (!isOpen) {
				simulation?.stop();
			}
		}, 300);
	}

	function handleItemClick(href: string) {
		handleClose();
		// Navigate after a small delay to let animation start
		setTimeout(() => {
			goto(href);
		}, 100);
	}

	function handleCenterClick() {
		// Only toggle if we didn't drag
		if (!hasDragged) {
			handleToggle();
		}
		hasDragged = false;
	}

	function handleCenterDragStart() {
		isDragging = true;
		hasDragged = false;
		simulation?.dragStart('center');
	}

	function handleCenterDragMove(x: number, y: number) {
		hasDragged = true;
		// Clamp to keep center node on screen (SVG is centered on viewport)
		// Convert viewport bounds to SVG coordinates
		const padding = centerRadius;
		const viewportW = window.innerWidth;
		const viewportH = window.innerHeight;
		// SVG center (cx, cy) maps to viewport center
		const minX = cx - viewportW / 2 + padding;
		const maxX = cx + viewportW / 2 - padding;
		const minY = cy - viewportH / 2 + padding;
		const maxY = cy + viewportH / 2 - padding;
		const clampedX = Math.max(minX, Math.min(maxX, x));
		const clampedY = Math.max(minY, Math.min(maxY, y));
		simulation?.dragMove('center', clampedX, clampedY);
	}

	function handleCenterDragEnd() {
		isDragging = false;
		simulation?.dragEnd('center');
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
			<!-- Render edges first (behind nodes) -->
			{#if isOpen}
				{#each edges as edge (edge.id)}
					{@const source = simState?.nodes.get(edge.source)}
					{@const target = simState?.nodes.get(edge.target)}
					{@const progress = edgeProgress.get(edge.id) ?? 0}
					{#if source && target}
						<ForceEdge {source} {target} {progress} curvature={0.3} />
					{/if}
				{/each}
			{/if}

			<!-- Render nodes -->
			{#each nodes as node (node.id)}
				{@const isCenter = node.data?.isCenter as boolean}
				{@const href = node.data?.href as string}
				{#if isCenter || isOpen}
					<ForceNode
						{node}
						visible={true}
						draggable={isCenter}
						{svgElement}
						onDragStart={isCenter ? handleCenterDragStart : undefined}
						onDragMove={isCenter ? handleCenterDragMove : undefined}
						onDragEnd={isCenter ? handleCenterDragEnd : undefined}
						onClick={isCenter ? handleCenterClick : href ? () => handleItemClick(href) : undefined}
					/>
				{/if}
			{/each}
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
