import { loadData } from '$lib/modules/sanity';
import { worksQuery } from '$lib/groq';
import type { ExpandedWork } from '$lib/types';

export async function load() {
	const works = await loadData<ExpandedWork[]>(worksQuery);
	return { works };
}
