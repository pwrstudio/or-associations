import { error } from '@sveltejs/kit';
import { loadData } from '$lib/modules/sanity';
import { pageBySlugQuery } from '$lib/groq';
import type { ExpandedPage } from '$lib/types';

export async function load({ params }) {
	const page = await loadData<ExpandedPage | null>(pageBySlugQuery, { slug: params.slug });

	if (!page) {
		throw error(404, 'Page not found');
	}

	return { page };
}
