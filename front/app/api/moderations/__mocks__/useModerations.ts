import { IModerationData } from '../types';

export const moderationsData: IModerationData[] = [
  {
    id: '4e2da56a-2db2-4769-9513-a214891aea21',
    type: 'moderation',
    attributes: {
      moderatable_type: 'Idea',
      content_title_multiloc: {
        en: 'Non Seattle parks green space',
      },
      content_body_multiloc: {
        en: 'Accessibility of non Seattle parks should be factored in.',
      },
      content_slug: 'non-seattle-parks-green-space',
      created_at: '2023-07-01T06:15:05.000Z',
      belongs_to: {
        project: {
          id: 'ba97111a-e75b-48bf-bd32-72a7a4e2576e',
          slug: '2024-park-and-open-space-plan-ideation-en-124',
          title_multiloc: {
            en: '2024 Park and Open Space Plan (ideation - EN - 124)',
            'es-CL': '2024 Park and Open Space Plan (ideation - EN - 124)',
            'nl-NL': '2024 Park and Open Space Plan (ideation - EN - 124)',
          },
        },
      },
      moderation_status: 'unread',
    },
    relationships: {},
  },
];

export default jest.fn(() => {
  return { data: { data: moderationsData } };
});
