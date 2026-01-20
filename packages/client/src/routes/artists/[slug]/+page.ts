import { error } from '@sveltejs/kit';
import { loadData } from '$lib/modules/sanity';
import { artistBySlugQuery } from '$lib/groq';
import type { ExpandedArtist } from '$lib/types';

export async function load({ params }) {
	const artist = await loadData<ExpandedArtist | null>(artistBySlugQuery, { slug: params.slug });

	if (!artist) {
		throw error(404, 'Artist not found');
	}

	return { artist };
}
