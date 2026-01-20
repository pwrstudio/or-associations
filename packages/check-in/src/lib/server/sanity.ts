import { createClient } from '@sanity/client';
import { SANITY_WRITE_TOKEN } from '$env/static/private';
import type { Settings, Node } from 'cms/types';

const SANITY_PROJECT_ID = '7gehchqh';
const SANITY_DATASET = 'production';

export const sanityClient = createClient({
	projectId: SANITY_PROJECT_ID,
	dataset: SANITY_DATASET,
	apiVersion: '2024-01-01',
	token: SANITY_WRITE_TOKEN,
	useCdn: false
});

type AllowedEmail = NonNullable<Settings['allowedEmails']>[number];

export type NodeData = Omit<Node, '_id' | '_type' | '_createdAt' | '_updatedAt' | '_rev'>;

/**
 * Upsert a node document - creates or updates based on anonymousId
 * The anonymousId is used as the document _id to ensure one node per member
 */
export async function upsertNode(anonymousId: string, data: NodeData): Promise<void> {
	await sanityClient.createOrReplace({
		_id: anonymousId,
		_type: 'node',
		...data
	});
}

/**
 * Get the node data for a given anonymousId
 */
export async function getNode(anonymousId: string): Promise<NodeData | null> {
	try {
		return await sanityClient.fetch<NodeData | null>(
			`*[_type == "node" && _id == $id][0]{ city, region, country, timezone, checkedInAt }`,
			{ id: anonymousId }
		);
	} catch {
		return null;
	}
}

export async function getSettings(): Promise<Settings | null> {
	try {
		return await sanityClient.fetch<Settings | null>(
			`*[_type == "settings" && _id == "settings"][0]{ _id, allowedEmails }`
		);
	} catch (err) {
		console.error('Failed to fetch settings from Sanity:', err);
		return null;
	}
}

export async function findAllowedEmail(email: string): Promise<AllowedEmail | null> {
	const settings = await getSettings();
	if (!settings?.allowedEmails) {
		return null;
	}

	const normalizedEmail = email.toLowerCase().trim();
	return (
		settings.allowedEmails.find((e) => e.email?.toLowerCase().trim() === normalizedEmail) || null
	);
}

export async function isEmailAllowed(email: string): Promise<boolean> {
	const entry = await findAllowedEmail(email);
	return entry !== null;
}

export async function getAuthHashForEmail(email: string): Promise<string | null> {
	const entry = await findAllowedEmail(email);
	return entry?.authHash || null;
}

/**
 * Register a member's authHash (only authHash stored in Settings, not anonymousId)
 */
export async function registerAuthHash(email: string, authHash: string): Promise<void> {
	const settings = await getSettings();
	if (!settings?.allowedEmails) {
		throw new Error('Settings not found');
	}

	const normalizedEmail = email.toLowerCase().trim();
	const index = settings.allowedEmails.findIndex(
		(e) => e.email?.toLowerCase().trim() === normalizedEmail
	);

	if (index === -1) {
		throw new Error('Email not in allowed list');
	}

	await sanityClient
		.patch('settings')
		.set({ [`allowedEmails[${index}].authHash`]: authHash })
		.commit();
}
