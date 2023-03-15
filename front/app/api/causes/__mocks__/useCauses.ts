import { ICauseData } from '../types';

export const causesData: ICauseData[] = [
  {
    id: '1',
    type: 'cause',
    attributes: {
      title_multiloc: {
        en: 'Cause 1',
      },
      description_multiloc: {
        en: 'Description of cause 1',
      },
      volunteers_count: 5,
      ordering: 1,
    },
    relationships: {
      participation_context: {
        data: {
          type: 'phase',
          id: '3',
        },
      },
    },
  },
  {
    id: '2',
    type: 'cause',
    attributes: {
      title_multiloc: {
        en: 'Cause 2',
      },
      description_multiloc: {
        en: 'Description of cause 2',
      },
      volunteers_count: 5,
      ordering: 2,
    },
    relationships: {
      participation_context: {
        data: {
          type: 'project',
          id: '1',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: causesData } };
});
