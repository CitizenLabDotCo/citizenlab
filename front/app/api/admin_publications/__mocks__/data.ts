import { IAdminPublicationData } from '../types';

export const mockFolderChildAdminPublicationsList: IAdminPublicationData[] = [
  {
    id: 'b3b91b93-e207-4cb0-b49b-737d4b25792e',
    type: 'admin_publication',
    attributes: {
      ordering: 0,
      publication_status: 'published',
      scheduled_status: null,
      scheduled_at: null,
      depth: 0,
      publication_title_multiloc: {
        en: 'Quas excepturi ea et.',
        'fr-BE': 'Et illo et aperiam.',
        'nl-BE': 'Praesentium ut itaque ipsam.',
      },
      publication_description_preview_multiloc: {
        en: 'Et omnis recusandae minima.',
        'fr-BE': 'Blanditiis et repellendus cupiditate.',
        'nl-BE': 'Libero est voluptatibus tenetur.',
      },
      publication_slug: 'quas-excepturi-ea-et',
      visible_children_count: 1,
      followers_count: 3,
    },
    relationships: {
      publication: {
        data: { id: '99d51572-250c-48f4-8950-ea454c9476c1', type: 'folder' },
      },
      parent: { data: null },
      children: {
        data: [
          {
            id: '6012d402-3a56-47a8-8ce6-7cd1c69fa29d',
            type: 'admin_publication',
          },
        ],
      },
      user_follower: {
        data: null,
      },
    },
  },
  {
    id: '8c8da82d-e4ea-4af4-8c7b-d221e86668cc',
    type: 'admin_publication',
    attributes: {
      ordering: 1,
      publication_status: 'archived',
      scheduled_status: null,
      scheduled_at: null,
      depth: 0,
      publication_title_multiloc: {
        en: 'Rem nulla consequatur vero.',
        'fr-BE': 'Ducimus voluptatem tempora expedita.',
        'nl-BE': 'Perferendis modi voluptatem facilis.',
      },
      publication_description_preview_multiloc: {
        en: 'Aspernatur ut eius excepturi.',
        'fr-BE': 'Esse incidunt dolore quos.',
        'nl-BE': 'Asperiores possimus labore sequi.',
      },
      publication_slug: 'rem-nulla-consequatur-vero',
      visible_children_count: 1,
      followers_count: 3,
    },
    relationships: {
      publication: {
        data: { id: 'c7f4f824-53e1-4b8c-866d-b3412f22d956', type: 'folder' },
      },
      user_follower: {
        data: null,
      },
      parent: { data: null },
      children: {
        data: [
          {
            id: '8e3a6d01-994e-40d9-9657-9771a100adaf',
            type: 'admin_publication',
          },
        ],
      },
    },
  },
];
