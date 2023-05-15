import { ITopicData } from '../types';

export const topicsData: ITopicData[] = [
  {
    id: '1',
    type: 'topic',
    attributes: {
      title_multiloc: {
        en: 'Topic 1',
      },
      description_multiloc: {
        en: 'Description of topic 1',
      },
      icon: 'icon-people',
      code: 'custom',
      ordering: 1,
      static_page_ids: ['1'],
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
    },
  },
  {
    id: '2',
    type: 'topic',
    attributes: {
      title_multiloc: {
        en: 'Topic 2',
      },
      description_multiloc: {
        en: 'Description of topic 2',
      },
      icon: 'icon-people',
      code: 'custom',
      ordering: 2,
      static_page_ids: ['2'],
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
    },
  },
];

export default jest.fn(() => {
  return { data: { data: topicsData } };
});
