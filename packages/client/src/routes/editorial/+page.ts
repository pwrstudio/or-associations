import { loadData } from '$lib/modules/sanity';
import { pagesQuery } from '$lib/groq';
import type { ExpandedPage } from '$lib/types';

export async function load() {
	const pages = await loadData<ExpandedPage[]>(pagesQuery);
	return { pages };
}
