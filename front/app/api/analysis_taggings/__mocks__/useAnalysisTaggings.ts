import { ITaggingData } from '../types';

export const taggingsData: ITaggingData[] = [
  {
    id: '1',
    type: 'analysis_tagging',
    relationships: {
      tag: {
        data: {
          id: '1',
          type: 'tag',
        },
      },
      input: {
        data: {
          id: '1',
          type: 'idea',
        },
      },
    },
  },
  {
    id: '2',
    type: 'analysis_tagging',
    relationships: {
      tag: {
        data: {
          id: '2',
          type: 'tag',
        },
      },
      input: {
        data: {
          id: '2',
          type: 'idea',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: taggingsData } };
});
