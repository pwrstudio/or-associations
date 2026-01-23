<script lang="ts">
	import Metadata from '$lib/components/Metadata.svelte';
	import { MediaSlideshow } from '$lib/components/MediaSlideshow';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Metadata type="landing" />

{#if data.landingPage?.slideshow && data.landingPage.slideshow.length > 0}
	<div class="landing-slideshow">
		<MediaSlideshow media={data.landingPage.slideshow} autoplay autoplayDelay={5000} />
	</div>
{/if}

<style lang="scss">
	.landing-slideshow {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
</style>
