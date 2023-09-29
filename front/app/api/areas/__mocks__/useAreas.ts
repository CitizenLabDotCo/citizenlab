import { IAreaData } from '../types';

export const areasData: IAreaData[] = [
  {
    id: '1',
    type: 'area',
    attributes: {
      title_multiloc: {
        en: 'Area 1',
      },
      description_multiloc: {},
      ordering: 1,
      static_page_ids: ['3'],
      followers_count: 3,
      include_in_onboarding: true,
    },
    relationships: {
      static_pages: {
        data: [
          {
            id: '3',
            type: 'static_page',
          },
        ],
      },
      user_follower: {
        data: null,
      },
    },
  },
  {
    id: '2',
    type: 'area',
    attributes: {
      title_multiloc: {
        en: 'Area 2',
      },
      description_multiloc: {},

      ordering: 1,
      static_page_ids: ['4'],
      followers_count: 3,
      include_in_onboarding: true,
    },
    relationships: {
      static_pages: {
        data: [
          {
            id: '4',
            type: 'static_page',
          },
        ],
      },
      user_follower: {
        data: null,
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: areasData } };
});
