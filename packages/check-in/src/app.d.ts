/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
		interface Locals {
			authHash: string | null;
			anonymousId: string | null;
		}
	}
}

export {};
