import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { deskStructure } from './deskStructure';

const SINGLETON_TYPES = ['settings'];

export default defineConfig({
	name: 'default',
	title: 'or-associations',

	projectId: '7gehchqh',
	dataset: 'production',

	plugins: [
		structureTool({
			structure: deskStructure
		}),
		visionTool()
	],

	schema: {
		types: schemaTypes,
		templates: (templates) =>
			templates.filter(({ schemaType }) => !SINGLETON_TYPES.includes(schemaType))
	}
});
