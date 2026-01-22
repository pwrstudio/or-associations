<script lang="ts">
	import {
		getEdgeToEdgePoints,
		generateBezierCurve,
		bezierToSVGPath,
		getBezierLength,
		getLineDrawStyles,
		type ForceNode
	} from '$lib/modules/force-graph';

	interface Props {
		source: ForceNode;
		target: ForceNode;
		progress: number;
		curvature?: number;
	}

	let { source, target, progress, curvature = 0.25 }: Props = $props();

	// Calculate path dynamically as nodes move
	let pathData = $derived.by(() => {
		const { start, end } = getEdgeToEdgePoints(source, target);
		const curve = generateBezierCurve(start, end, curvature);
		return {
			d: bezierToSVGPath(curve),
			length: getBezierLength(curve)
		};
	});

	// Line drawing animation styles
	let lineStyles = $derived.by(() => {
		return getLineDrawStyles(pathData.length, progress, 'forward');
	});
</script>

<path
	class="force-edge"
	d={pathData.d}
	stroke-dasharray={lineStyles.dashArray}
	stroke-dashoffset={lineStyles.dashOffset}
/>

<style>
	.force-edge {
		fill: none;
		stroke: var(--color-foreground);
		stroke-width: 2;
		stroke-linecap: round;
	}
</style>
