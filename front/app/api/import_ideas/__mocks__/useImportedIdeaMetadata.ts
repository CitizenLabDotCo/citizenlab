import { ImportedIdeaMetadata } from '../types';

export const ideaImport: ImportedIdeaMetadata = {
  id: '1',
  type: 'idea_import',
  attributes: {
    created_at: '2023-09-14T17:40:05.892Z',
    file: {
      url: '/web_api/v1/idea_import_files/fb3c5623-0a43-41ad-843d-33c62d844c99',
    },
    import_type: 'pdf',
    locale: 'en',
    page_range: ['1', '2'],
    updated_at: '2023-09-14T17:40:05.892Z',
    user_consent: true,
    user_created: true,
  },
};

export default jest.fn(() => {
  return { data: { data: ideaImport } };
});
