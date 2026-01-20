import { defineType, defineField } from 'sanity';

export const Settings = defineType({
	name: 'settings',
	title: 'Settings',
	type: 'document',
	fields: [
		defineField({
			name: 'allowedEmails',
			title: 'Allowed Member Emails',
			description: 'List of email addresses allowed to check in',
			type: 'array',
			of: [
				{
					type: 'object',
					fields: [
						{
							name: 'email',
							title: 'Email',
							type: 'string',
							validation: (Rule) => Rule.required().email()
						},
						{
							name: 'authHash',
							title: 'Auth Hash',
							type: 'string',
							readOnly: true,
							description: 'For authentication (auto-generated on sign up)'
						}
					],
					preview: {
						select: {
							email: 'email',
							authHash: 'authHash'
						},
						prepare({ email, authHash }) {
							return {
								title: email,
								subtitle: authHash ? 'Registered' : 'Not registered'
							};
						}
					}
				}
			]
		})
	],
	preview: {
		prepare() {
			return {
				title: 'Settings'
			};
		}
	}
});
