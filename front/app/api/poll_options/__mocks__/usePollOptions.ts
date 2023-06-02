import { IPollOptionData } from '../types';

export const pollOptionsData: IPollOptionData[] = [
  {
    id: 'id',
    type: 'option',
    attributes: {
      title_multiloc: { en: 'A mock option 1' },
      ordering: 1,
    },
  },
  {
    id: 'id',
    type: 'option',
    attributes: {
      title_multiloc: { en: 'A mock option2' },
      ordering: 2,
    },
  },
];

export default jest.fn(() => {
  return { data: { data: pollOptionsData } };
});
