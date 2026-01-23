<script lang="ts">
	/**
	 * ForceEdge - Pure rendering component
	 * Receives pre-computed path and dash styles, just renders SVG
	 * No geometry computation here
	 */

	interface Props {
		path: string;
		dashArray: string;
		dashOffset: number;
	}

	let { path, dashArray, dashOffset }: Props = $props();
</script>

<path class="force-edge" d={path} stroke-dasharray={dashArray} stroke-dashoffset={dashOffset} />

<style>
	.force-edge {
		fill: none;
		stroke: var(--color-foreground);
		stroke-width: 2;
		stroke-linecap: round;
		opacity: 0.5;
	}
</style>
