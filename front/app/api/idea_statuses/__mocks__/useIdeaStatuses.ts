import { IIdeaStatusData } from '../types';

export const ideaStatusesData: IIdeaStatusData[] = [
  {
    id: '1',
    type: 'idea_status',
    attributes: {
      code: 'proposed',
      title_multiloc: {
        en: 'Idea 1',
      },
      description_multiloc: {
        en: 'Description of idea 1',
      },
      color: '#FF0000',
      ordering: 1,
    },
  },
  {
    id: '2',
    type: 'idea_status',
    attributes: {
      code: 'under_consideration',
      title_multiloc: {
        en: 'Idea 2',
      },
      description_multiloc: {
        en: 'Description of idea 2',
      },
      color: '#00FF00',
      ordering: 2,
    },
  },
];

export default jest.fn(() => {
  return { data: { data: ideaStatusesData } };
});
