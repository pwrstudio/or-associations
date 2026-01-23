import { loadData } from '$lib/modules/sanity';
import { landingPageQuery } from '$lib/groq';
import type { LandingPage } from '$lib/types';

export async function load() {
	const landingPage = await loadData<LandingPage | null>(landingPageQuery);
	return { landingPage };
}
