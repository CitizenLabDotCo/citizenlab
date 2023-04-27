import { IAreaData } from '../types';

export const areasData: IAreaData[] = [
  {
    id: '1',
    type: 'area',
    attributes: {
      title_multiloc: {
        en: 'Area 1',
      },
      description_multiloc: {
        en: 'Description of area 1',
      },

      ordering: 1,
      static_page_ids: ['3'],
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
    },
  },
  {
    id: '2',
    type: 'area',
    attributes: {
      title_multiloc: {
        en: 'Area 2',
      },
      description_multiloc: {
        en: 'Description of area 2',
      },

      ordering: 1,
      static_page_ids: ['4'],
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
    },
  },
];

export default jest.fn(() => {
  return { data: { data: areasData } };
});
