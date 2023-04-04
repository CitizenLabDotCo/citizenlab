import { IInitiativeStatusData } from '../types';

export const initiativeStatusesData: IInitiativeStatusData[] = [
  {
    id: '1',
    type: 'initiative_status',
    attributes: {
      code: 'proposed',
      title_multiloc: {
        en: 'Idea status 1',
      },
      description_multiloc: {
        en: 'Description of initiative status 1',
      },
      color: '#FF0000',
      ordering: 1,
      transition_type: 'automatic',
    },
  },
  {
    id: '2',
    type: 'initiative_status',
    attributes: {
      code: 'answered',
      title_multiloc: {
        en: 'Idea status 2',
      },
      description_multiloc: {
        en: 'Description of initiative status 2',
      },
      color: '#00FF00',
      ordering: 2,
      transition_type: 'manual',
    },
  },
];

export default jest.fn(() => {
  return { data: { data: initiativeStatusesData } };
});
