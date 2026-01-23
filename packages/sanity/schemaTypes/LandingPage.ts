import { defineType, defineField } from 'sanity';

export const LandingPage = defineType({
	name: 'landingPage',
	title: 'Landing Page',
	type: 'document',
	fields: [
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
		})
	],
	preview: {
		prepare() {
			return {
				title: 'Landing Page'
			};
		}
	}
});
