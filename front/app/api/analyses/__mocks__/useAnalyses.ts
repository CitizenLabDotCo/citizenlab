import { IAnalysisData } from '../types';

export const analysesData: IAnalysisData[] = [
  {
    id: '1',
    type: 'analysis',
    attributes: {
      created_at: '2021-06-01T08:00:00.000Z',
      updated_at: '2021-06-01T08:00:00.000Z',
      participation_method: 'native_survey',
    },
    relationships: {
      project: {
        data: {
          id: '1',
          type: 'project',
        },
      },
      custom_fields: {
        data: [
          {
            id: '1',
            type: 'custom_field',
          },
        ],
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: analysesData } };
});
