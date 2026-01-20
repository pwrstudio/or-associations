import { error } from '@sveltejs/kit';
import { loadData } from '$lib/modules/sanity';
import { projectBySlugQuery } from '$lib/groq';
import type { ExpandedProject } from '$lib/types';

export async function load({ params }) {
	const project = await loadData<ExpandedProject | null>(projectBySlugQuery, { slug: params.slug });

	if (!project) {
		throw error(404, 'Project not found');
	}

	return { project };
}
