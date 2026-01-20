import { loadData } from '$lib/modules/sanity';
import { projectsQuery } from '$lib/groq';
import type { ExpandedProject } from '$lib/types';

export async function load() {
	const projects = await loadData<ExpandedProject[]>(projectsQuery);
	return { projects };
}
