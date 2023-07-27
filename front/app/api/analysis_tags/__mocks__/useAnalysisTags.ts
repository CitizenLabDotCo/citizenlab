import { ITagData } from '../types';

export const tagsData: ITagData[] = [
  {
    id: '1',
    type: 'tag',
    attributes: {
      name: 'Tag 1',
      tag_type: 'custom',
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
    },
    relationships: {
      analysis: {
        data: {
          id: '1',
          type: 'analysis',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: tagsData } };
});
