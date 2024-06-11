import { IAnalysisData } from '../types';

export const analysesData: IAnalysisData[] = [
  {
    id: '1',
    type: 'analysis',
    attributes: {
      created_at: '2021-06-01T08:00:00.000Z',
      updated_at: '2021-06-01T08:00:00.000Z',
      participation_method: 'native_survey',
      show_insights: true,
    },
    relationships: {
      project: {
        data: {
          id: '1',
          type: 'project',
        },
      },
      all_custom_fields: {
        data: [
          {
            id: '1',
            type: 'custom_field',
          },
        ],
      },
      additional_custom_fields: {
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
