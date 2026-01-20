import { defineType, defineField } from 'sanity';

export const Artist = defineType({
	name: 'artist',
	title: 'Artist',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Name',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'name',
				maxLength: 96
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'profileImage',
			title: 'Profile Image',
			type: 'image',
			options: {
				hotspot: true
			}
		}),
		defineField({
			name: 'bio',
			title: 'Bio',
			type: 'array',
			of: [{ type: 'block' }]
		})
	],
	preview: {
		select: {
			title: 'name',
			media: 'profileImage'
		}
	}
});
