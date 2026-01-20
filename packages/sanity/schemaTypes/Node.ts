import { defineType, defineField } from 'sanity';

export const Node = defineType({
	name: 'node',
	title: 'Node',
	type: 'document',
	// The document _id is the anonymousId (hash of email with separate salt)
	// This ensures one node per member and provides anonymity
	fields: [
		defineField({
			name: 'geopoint',
			title: 'Coordinates',
			type: 'geopoint',
			description: 'Click the map to set location'
		}),
		defineField({
			name: 'city',
			title: 'City',
			type: 'string'
		}),
		defineField({
			name: 'region',
			title: 'Region',
			type: 'string'
		}),
		defineField({
			name: 'country',
			title: 'Country',
			type: 'string'
		}),
		defineField({
			name: 'timezone',
			title: 'Timezone',
			type: 'string'
		}),
		defineField({
			name: 'checkedInAt',
			title: 'Checked In At',
			type: 'datetime',
			readOnly: true
		})
	],
	preview: {
		select: {
			city: 'city',
			country: 'country',
			date: 'checkedInAt'
		},
		prepare({ city, country, date }) {
			return {
				title: [city, country].filter(Boolean).join(', ') || 'Unknown location',
				subtitle: date ? new Date(date).toLocaleDateString() : ''
			};
		}
	}
});
