import { error } from '@sveltejs/kit';
import { loadData } from '$lib/modules/sanity';
import { aboutQuery } from '$lib/groq';
import type { About } from '$lib/types';

export async function load() {
	const about = await loadData<About | null>(aboutQuery);

	if (!about) {
		throw error(404, 'About page not found');
	}

	return { about };
}
