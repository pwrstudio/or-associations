import { defineType, defineField } from 'sanity';

export const Page = defineType({
	name: 'page',
	title: 'Page',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'content',
			title: 'Content',
			type: 'array',
			of: [{ type: 'block' }]
		}),
		defineField({
			name: 'artists',
			title: 'Artist(s)',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'artist' }]
				}
			]
		})
	],
	preview: {
		select: {
			title: 'title'
		}
	}
});
