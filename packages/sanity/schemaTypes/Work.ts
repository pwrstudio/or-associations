import { defineType, defineField } from 'sanity';

export const Work = defineType({
	name: 'work',
	title: 'Work',
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
			name: 'year',
			title: 'Year',
			type: 'number',
			validation: (Rule) => Rule.min(1900).max(2100)
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
		}),
		defineField({
			name: 'media',
			title: 'Media',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'imageMedia',
					title: 'Image',
					fields: [
						{ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } },
						{ name: 'caption', type: 'string', title: 'Caption' }
					],
					preview: {
						select: { media: 'image', title: 'caption' },
						prepare({ media, title }) {
							return { title: title || 'Image', media };
						}
					}
				},
				{
					type: 'object',
					name: 'videoMedia',
					title: 'Video',
					fields: [
						{ name: 'file', type: 'file', title: 'Video File' },
						{ name: 'caption', type: 'string', title: 'Caption' }
					],
					preview: {
						select: { title: 'caption' },
						prepare({ title }) {
							return { title: title || 'Video' };
						}
					}
				},
				{
					type: 'object',
					name: 'audioMedia',
					title: 'Audio',
					fields: [
						{ name: 'file', type: 'file', title: 'Audio File' },
						{ name: 'caption', type: 'string', title: 'Caption' }
					],
					preview: {
						select: { title: 'caption' },
						prepare({ title }) {
							return { title: title || 'Audio' };
						}
					}
				},
				{
					type: 'object',
					name: 'embedMedia',
					title: 'Embed Link',
					fields: [
						{ name: 'url', type: 'url', title: 'URL' },
						{ name: 'caption', type: 'string', title: 'Caption' }
					],
					preview: {
						select: { title: 'caption', url: 'url' },
						prepare({ title, url }) {
							return { title: title || url || 'Embed' };
						}
					}
				}
			]
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'text'
		}),
		defineField({
			name: 'medium',
			title: 'Medium',
			type: 'string'
		})
	],
	preview: {
		select: {
			title: 'title',
			year: 'year',
			media: 'media.0.image'
		},
		prepare({ title, year, media }) {
			return {
				title: title,
				subtitle: year ? `${year}` : '',
				media
			};
		}
	}
});
