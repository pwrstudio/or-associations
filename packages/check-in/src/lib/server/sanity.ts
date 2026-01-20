import { createClient, type SanityClient } from '@sanity/client';
import { env } from '$env/dynamic/private';
import type { Settings, Node } from 'cms/types';
import bcrypt from 'bcrypt';

const SANITY_PROJECT_ID = '7gehchqh';
const SANITY_DATASET = 'production';
const BCRYPT_ROUNDS = 12;

let _sanityClient: SanityClient | null = null;

function getSanityClient(): SanityClient {
	if (!_sanityClient) {
		_sanityClient = createClient({
			projectId: SANITY_PROJECT_ID,
			dataset: SANITY_DATASET,
			apiVersion: '2024-01-01',
			token: env.SANITY_WRITE_TOKEN,
			useCdn: false
		});
	}
	return _sanityClient;
}

type AllowedEmail = NonNullable<Settings['allowedEmails']>[number];

export type NodeData = Omit<Node, '_id' | '_type' | '_createdAt' | '_updatedAt' | '_rev'>;

/**
 * Upsert a node document - creates or updates based on anonymousId
 * The anonymousId is used as the document _id to ensure one node per member
 */
export async function upsertNode(anonymousId: string, data: NodeData): Promise<void> {
	await getSanityClient().createOrReplace({
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
		return await getSanityClient().fetch<NodeData | null>(
			`*[_type == "node" && _id == $id][0]{ city, region, country, timezone, checkedInAt }`,
			{ id: anonymousId }
		);
	} catch {
		return null;
	}
}

export async function getSettings(): Promise<Settings | null> {
	try {
		return await getSanityClient().fetch<Settings | null>(
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

/**
 * Check if a member has registered (has a password set)
 */
export async function isRegistered(email: string): Promise<boolean> {
	const entry = await findAllowedEmail(email);
	return entry?.passwordHash != null;
}

/**
 * Verify a password against the stored hash
 */
export async function verifyPassword(email: string, password: string): Promise<boolean> {
	const entry = await findAllowedEmail(email);
	if (!entry?.passwordHash) {
		return false;
	}
	return bcrypt.compare(password, entry.passwordHash);
}

/**
 * Register a member with a password
 */
export async function registerPassword(email: string, password: string): Promise<void> {
	const settings = await getSettings();
	if (!settings?.allowedEmails) {
		throw new Error('Settings not found');
	}

	const normalizedEmail = email.toLowerCase().trim();
	const entry = settings.allowedEmails.find(
		(e) => e.email?.toLowerCase().trim() === normalizedEmail
	);

	if (!entry) {
		throw new Error('Email not in allowed list');
	}

	if (entry.passwordHash) {
		throw new Error('Already registered');
	}

	const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

	// Use _key to patch the specific array item
	await getSanityClient()
		.patch('settings')
		.set({ [`allowedEmails[_key=="${entry._key}"].passwordHash`]: passwordHash })
		.commit();
}
