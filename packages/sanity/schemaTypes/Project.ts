import { defineType, defineField } from 'sanity';

export const Project = defineType({
	name: 'project',
	title: 'Project',
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
			name: 'category',
			title: 'Category',
			type: 'string'
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
			name: 'slideshow',
			title: 'Slideshow',
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
			type: 'array',
			of: [{ type: 'block' }]
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
				}
			]
		}),
		defineField({
			name: 'location',
			title: 'Location Name',
			type: 'string',
			description: 'e.g. "Konserthuset, Stockholm"'
		}),
		defineField({
			name: 'geopoint',
			title: 'Location Coordinates',
			type: 'geopoint',
			description: 'Click the map to set coordinates'
		}),
		defineField({
			name: 'dateStart',
			title: 'Start Date',
			type: 'date'
		}),
		defineField({
			name: 'dateEnd',
			title: 'End Date',
			type: 'date'
		}),
		defineField({
			name: 'time',
			title: 'Time',
			type: 'string'
		}),
		defineField({
			name: 'works',
			title: 'Works',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'work' }]
				}
			]
		})
	],
	preview: {
		select: {
			title: 'title',
			category: 'category',
			media: 'slideshow.0.image'
		},
		prepare({ title, category, media }) {
			return {
				title: title,
				subtitle: category || '',
				media
			};
		}
	}
});
