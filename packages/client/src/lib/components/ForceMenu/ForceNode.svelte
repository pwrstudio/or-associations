<script lang="ts">
	/**
	 * ForceNode - Pure rendering component
	 * Receives pre-computed position and renders SVG element
	 * No physics or state computation here
	 */

	interface Props {
		x: number;
		y: number;
		radius: number;
		label: string;
		href?: string;
		isCenter?: boolean;
		visible?: boolean;
		draggable?: boolean;
		onDragStart?: () => void;
		onDragMove?: (x: number, y: number) => void;
		onDragEnd?: () => void;
		onClick?: () => void;
		svgElement: SVGSVGElement | null;
	}

	let {
		x,
		y,
		radius,
		label,
		href,
		isCenter = false,
		visible = true,
		draggable = false,
		onDragStart,
		onDragMove,
		onDragEnd,
		onClick,
		svgElement
	}: Props = $props();

	let isDragging = $state(false);

	function pageToSvg(clientX: number, clientY: number): { x: number; y: number } {
		if (!svgElement) return { x: clientX, y: clientY };

		const point = svgElement.createSVGPoint();
		point.x = clientX;
		point.y = clientY;

		const ctm = svgElement.getScreenCTM();
		if (!ctm) return { x: clientX, y: clientY };

		const svgPoint = point.matrixTransform(ctm.inverse());
		return { x: svgPoint.x, y: svgPoint.y };
	}

	function handlePointerDown(e: PointerEvent) {
		if (!draggable || !onDragStart) return;

		isDragging = true;
		onDragStart();

		const target = e.target as Element;
		target.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging || !onDragMove) return;

		const { x, y } = pageToSvg(e.clientX, e.clientY);
		onDragMove(x, y);
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging || !onDragEnd) return;

		isDragging = false;
		onDragEnd();

		const target = e.target as Element;
		target.releasePointerCapture(e.pointerId);
	}

	function handleClick() {
		if (onClick) {
			onClick();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}
</script>

<g
	class="force-node"
	class:is-center={isCenter}
	class:is-dragging={isDragging}
	class:is-visible={visible}
	transform="translate({x}, {y})"
>
	{#if href && !isCenter}
		<a {href}>
			<circle
				r={radius}
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				onpointerup={handlePointerUp}
				onpointercancel={handlePointerUp}
				onclick={handleClick}
				onkeydown={handleKeyDown}
				tabindex="0"
				role="button"
			/>
			<text dy="0.35em">{label}</text>
		</a>
	{:else}
		<circle
			r={radius}
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
			onclick={handleClick}
			onkeydown={handleKeyDown}
			tabindex="0"
			role="button"
		/>
		<text dy="0.35em">{label}</text>
	{/if}
</g>

<style>
	.force-node {
		cursor: pointer;
		visibility: hidden;
		opacity: 0;
		transition:
			opacity 0.2s ease,
			visibility 0.2s ease;
	}

	.force-node.is-visible {
		visibility: visible;
		opacity: 1;
	}

	.force-node.is-dragging {
		cursor: grabbing;
	}

	.force-node circle {
		fill: transparent;
		stroke: var(--color-foreground);
		stroke-width: 2;
		outline: none;
	}

	.force-node text {
		fill: var(--color-text);
		text-anchor: middle;
		font-size: 1em;
		pointer-events: none;
	}

	.force-node.is-center {
		visibility: visible;
		opacity: 1;
		font-size: 2em;
		border: none;
	}

	.force-node a {
		text-decoration: none;
	}

	.force-node a:hover text {
		text-decoration: underline;
	}
</style>
