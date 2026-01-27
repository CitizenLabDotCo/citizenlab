import { IGlobalTopicData } from '../types';

export const globalTopicsData: IGlobalTopicData[] = [
  {
    id: '1',
    type: 'global_topic',
    attributes: {
      title_multiloc: {
        en: 'Topic 1',
      },
      description_multiloc: {
        en: 'Description of topic 1',
      },
      icon: 'icon-people',
      ordering: 1,
      static_page_ids: ['1'],
      followers_count: 2,
      include_in_onboarding: true,
    },
    relationships: {
      static_pages: {
        data: [
          {
            type: 'static_page',
            id: '1',
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
    type: 'global_topic',
    attributes: {
      title_multiloc: {
        en: 'Topic 2',
      },
      description_multiloc: {
        en: 'Description of topic 2',
      },
      icon: 'icon-people',
      ordering: 2,
      static_page_ids: ['2'],
      followers_count: 2,
      include_in_onboarding: true,
    },
    relationships: {
      static_pages: {
        data: [
          {
            type: 'static_page',
            id: '2',
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
  return { data: { data: globalTopicsData } };
});
