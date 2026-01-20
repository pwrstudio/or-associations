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
							name: 'passwordHash',
							title: 'Password Hash',
							type: 'string',
							readOnly: true,
							description: 'Hashed password (auto-generated on sign up)'
						}
					],
					preview: {
						select: {
							email: 'email',
							passwordHash: 'passwordHash'
						},
						prepare({ email, passwordHash }) {
							return {
								title: email,
								subtitle: passwordHash ? 'Registered' : 'Not registered'
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
