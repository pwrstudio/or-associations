<script lang="ts">
	import { onMount } from 'svelte';
	import Swiper from 'swiper';
	import 'swiper/css';
	import type { MediaItem } from '$lib/types';
	import ImageSlide from './ImageSlide.svelte';
	import VideoSlide from './VideoSlide.svelte';
	import AudioSlide from './AudioSlide.svelte';
	import EmbedSlide from './EmbedSlide.svelte';

	interface Props {
		media: MediaItem[];
		initialIndex?: number;
		onSlideChange?: (index: number) => void;
	}

	let { media, initialIndex = 0, onSlideChange }: Props = $props();

	let swiperContainer: HTMLDivElement | null = $state(null);
	let swiper: Swiper | null = $state(null);
	let loopEnabled = $derived(media.length > 1);

	onMount(() => {
		if (!swiperContainer) return;

		swiper = new Swiper(swiperContainer, {
			loop: loopEnabled,
			initialSlide: initialIndex,
			grabCursor: true,
			keyboard: { enabled: true },
			on: {
				slideChange: (s) => {
					onSlideChange?.(loopEnabled ? s.realIndex : s.activeIndex);
				}
			}
		});

		return () => {
			swiper?.destroy();
		};
	});

	export function goToPrev() {
		swiper?.slidePrev();
	}

	export function goToNext() {
		swiper?.slideNext();
	}

	export function goToSlide(index: number) {
		if (loopEnabled) {
			swiper?.slideToLoop(index);
		} else {
			swiper?.slideTo(index);
		}
	}
</script>

<div class="slideshow">
	<div class="swiper" bind:this={swiperContainer}>
		<div class="swiper-wrapper">
			{#each media as item (item._key)}
				<div class="swiper-slide">
					{#if item._type === 'imageMedia'}
						<ImageSlide {item} />
					{:else if item._type === 'videoMedia'}
						<VideoSlide {item} />
					{:else if item._type === 'audioMedia'}
						<AudioSlide {item} />
					{:else if item._type === 'embedMedia'}
						<EmbedSlide {item} />
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.slideshow {
		width: 100%;
		height: 100%;
		overflow: hidden;
		user-select: none;
	}

	.swiper {
		width: 100%;
		height: 100%;
	}

	:global(.swiper-slide) {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
</style>
