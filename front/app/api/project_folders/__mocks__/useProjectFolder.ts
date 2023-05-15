export const projectFolderData = {
  data: {
    id: '75c554af-5dcd-4ece-801b-91282fe4b37f',
    type: 'folder',
    attributes: {
      title_multiloc: {
        en: 'new folder',
        'fr-BE': 'new folder',
        'nl-BE': 'new folder',
        'nl-NL': 'new folder',
      },
      description_preview_multiloc: {
        en: ' ',
        'fr-BE': ' ',
        'nl-BE': ' ',
        'nl-NL': ' ',
      },
      slug: 'new-folder',
      created_at: '2023-05-08T14:56:00.360Z',
      updated_at: '2023-05-08T14:56:00.385Z',
      description_multiloc: { en: '', 'fr-BE': '', 'nl-BE': '', 'nl-NL': '' },
      header_bg: { large: null, medium: null, small: null },
      visible_projects_count: 0,
    },
    relationships: {
      admin_publication: {
        data: {
          id: '0f64b476-36c5-40ff-9e57-a8c57c6dd68c',
          type: 'admin_publication',
        },
      },
      images: { data: [] },
    },
  },
  included: [
    {
      id: '0f64b476-36c5-40ff-9e57-a8c57c6dd68c',
      type: 'admin_publication',
      attributes: {
        ordering: 0,
        publication_status: 'published',
        depth: 0,
        publication_title_multiloc: {
          en: 'new folder',
          'fr-BE': 'new folder',
          'nl-BE': 'new folder',
          'nl-NL': 'new folder',
        },
        publication_description_multiloc: {
          en: '',
          'fr-BE': '',
          'nl-BE': '',
          'nl-NL': '',
        },
        publication_description_preview_multiloc: {
          en: ' ',
          'fr-BE': ' ',
          'nl-BE': ' ',
          'nl-NL': ' ',
        },
        publication_slug: 'new-folder',
        visible_children_count: 0,
      },
      relationships: {
        publication: {
          data: { id: '75c554af-5dcd-4ece-801b-91282fe4b37f', type: 'folder' },
        },
        parent: { data: null },
        children: { data: [] },
      },
    },
  ],
};

export default jest.fn(() => {
  return { data: { data: projectFolderData } };
});
