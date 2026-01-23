import { defineType, defineField } from 'sanity';

export const About = defineType({
	name: 'about',
	title: 'About',
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
		})
	],
	preview: {
		prepare() {
			return {
				title: 'About'
			};
		}
	}
});
