import { error } from '@sveltejs/kit';
import { loadData } from '$lib/modules/sanity';
import { workBySlugQuery } from '$lib/groq';
import type { ExpandedWork } from '$lib/types';

export async function load({ params }) {
	const work = await loadData<ExpandedWork | null>(workBySlugQuery, { slug: params.slug });

	if (!work) {
		throw error(404, 'Work not found');
	}

	return { work };
}
