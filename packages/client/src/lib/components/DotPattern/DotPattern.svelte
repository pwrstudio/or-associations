<script lang="ts">
	/**
	 * DotPattern - Configurable SVG dot pattern background
	 */

	interface Props {
		/** Dot color (CSS color value) */
		color?: string;
		/** Dot radius in pixels */
		size?: number;
		/** Spacing between dot centers in pixels */
		spacing?: number;
		/** Pattern opacity (0-1) */
		opacity?: number;
	}

	let { color = '#d0d0d0', size = 1, spacing = 10, opacity = 0.1 }: Props = $props();

	const patternId = `dot-pattern-${Math.random().toString(36).slice(2, 9)}`;
</script>

<svg class="dot-pattern" style="opacity: {opacity}">
	<defs>
		<pattern
			id={patternId}
			x="0"
			y="0"
			width={spacing}
			height={spacing}
			patternUnits="userSpaceOnUse"
		>
			<circle cx={spacing / 2} cy={spacing / 2} r={size} fill={color} />
		</pattern>
	</defs>
	<rect width="100%" height="100%" fill="url(#{patternId})" />
</svg>

<style>
	.dot-pattern {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
