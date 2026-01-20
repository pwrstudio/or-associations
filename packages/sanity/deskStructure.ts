import type { StructureBuilder } from 'sanity/structure';

export const deskStructure = (S: StructureBuilder) =>
	S.list()
		.title('Content')
		.items([
			S.documentTypeListItem('artist').title('Artists'),
			S.documentTypeListItem('work').title('Works'),
			S.documentTypeListItem('project').title('Projects'),
			S.documentTypeListItem('page').title('Pages'),
			S.divider(),
			S.documentTypeListItem('node').title('Nodes'),
			S.divider(),
			S.listItem()
				.title('Settings')
				.id('settings')
				.child(S.document().schemaType('settings').documentId('settings'))
		]);
