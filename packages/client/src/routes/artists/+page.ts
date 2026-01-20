import { loadData } from '$lib/modules/sanity';
import { artistsQuery } from '$lib/groq';
import type { ExpandedArtist } from '$lib/types';

export async function load() {
	const artists = await loadData<ExpandedArtist[]>(artistsQuery);
	return { artists };
}
