<script lang="ts">
	import type { ExpandedArtist, ExpandedWork, ExpandedProject, ExpandedPage } from '$lib/types';
	import { urlFor } from '$lib/modules/sanity';

	type Props = {
		type?: 'landing' | 'artist' | 'work' | 'project' | 'page';
		artist?: ExpandedArtist;
		work?: ExpandedWork;
		project?: ExpandedProject;
		page?: ExpandedPage;
		title?: string;
		description?: string;
	};

	const {
		type = 'landing',
		artist,
		work,
		project,
		page,
		title: customTitle,
		description: customDescription
	}: Props = $props();

	const siteName = 'or-associations';
	const siteUrl = 'https://or-associations.se';
	const defaultDescription = 'or-associations';

	function truncateDescription(text: string, maxLength = 155): string {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
	}

	function extractTextFromBlocks(
		blocks: Array<{ children?: Array<{ text?: string }> }> | undefined
	): string {
		if (!blocks) return '';
		return blocks
			.map((block) => block.children?.map((c) => c.text).join('') || '')
			.join(' ')
			.trim();
	}

	const title = $derived.by(() => {
		if (customTitle) return customTitle;
		if (type === 'artist' && artist) return `${artist.name} | ${siteName}`;
		if (type === 'work' && work) return `${work.title} | ${siteName}`;
		if (type === 'project' && project) return `${project.title} | ${siteName}`;
		if (type === 'page' && page) return `${page.title} | ${siteName}`;
		return siteName;
	});

	const description = $derived.by(() => {
		let desc = defaultDescription;
		if (customDescription) {
			desc = customDescription;
		} else if (type === 'artist' && artist?.bio) {
			desc = extractTextFromBlocks(artist.bio) || defaultDescription;
		} else if (type === 'work' && work?.description) {
			desc = work.description;
		} else if (type === 'project' && project?.description) {
			desc = extractTextFromBlocks(project.description) || defaultDescription;
		} else if (type === 'page' && page?.content) {
			desc = extractTextFromBlocks(page.content) || defaultDescription;
		}
		return truncateDescription(desc);
	});

	const canonicalUrl = $derived.by(() => {
		if (type === 'artist' && artist) return `${siteUrl}/artists/${artist.slug?.current}`;
		if (type === 'work' && work) return `${siteUrl}/works/${work.slug?.current}`;
		if (type === 'project' && project) return `${siteUrl}/projects/${project.slug?.current}`;
		if (type === 'page' && page) return `${siteUrl}/editorial/${page.slug?.current}`;
		return siteUrl;
	});

	const ogType = $derived(type === 'landing' ? 'website' : 'article');

	const ogImage = $derived.by(() => {
		if (type === 'artist' && artist?.profileImage) {
			return urlFor(artist.profileImage).width(1200).height(630).url();
		}
		if (type === 'work' && work?.media?.[0]?._type === 'imageMedia' && work.media[0].image) {
			return urlFor(work.media[0].image).width(1200).height(630).url();
		}
		if (
			type === 'project' &&
			project?.slideshow?.[0]?._type === 'imageMedia' &&
			project.slideshow[0].image
		) {
			return urlFor(project.slideshow[0].image).width(1200).height(630).url();
		}
		return undefined;
	});

	const ogImageAlt = $derived.by(() => {
		if (type === 'artist' && artist) return artist.name || siteName;
		if (type === 'work' && work) return work.title || siteName;
		if (type === 'project' && project) return project.title || siteName;
		if (type === 'page' && page) return page.title || siteName;
		return siteName;
	});

	const websiteJsonLd = $derived.by(() => {
		if (type !== 'landing') return null;
		return JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: siteName,
			url: siteUrl
		});
	});

	const articleJsonLd = $derived.by(() => {
		if (type === 'landing') return null;
		const jsonLd: Record<string, unknown> = {
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: title,
			description: description,
			url: canonicalUrl
		};
		if (ogImage) {
			jsonLd.image = ogImage;
		}
		return JSON.stringify(jsonLd);
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	<meta name="robots" content="index, follow" />

	<!-- Open Graph -->
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:locale" content="en_US" />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
		<meta property="og:image:alt" content={ogImageAlt} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if ogImage}
		<meta name="twitter:image" content={ogImage} />
		<meta name="twitter:image:alt" content={ogImageAlt} />
	{/if}

	<!-- JSON-LD Structured Data -->
	{#if websiteJsonLd}
		{@html `<script type="application/ld+json">${websiteJsonLd}</script>`}
	{/if}
	{#if articleJsonLd}
		{@html `<script type="application/ld+json">${articleJsonLd}</script>`}
	{/if}
</svelte:head>
