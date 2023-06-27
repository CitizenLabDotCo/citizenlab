import { IExperimentData } from '../types';

export const experimentsData: IExperimentData[] = [
  {
    id: '_1',
    type: 'experiment',
    attributes: {
      name: 'Button location',
      treatment: 'Right',
      action: 'Button clicked',
    },
  },
  {
    id: '_1',
    type: 'experiment',
    attributes: {
      name: 'Button location',
      treatment: 'Left',
      action: 'Page entered',
    },
  },
];

export default jest.fn(() => {
  return { data: { data: experimentsData } };
});
