import { IOfficialFeedbacks } from 'services/officialFeedback';

export const mockOfficialFeedback = {
  data: [
    {
      type: 'official_feedback',
      id: 'feedbackId1',
      attributes: {
        author_multiloc: {
          en: 'Testing Official Department',
        },
        body_multiloc: {
          en: 'Update: Do Not Keep Calm, please panic now. End of transmission.',
        },
        created_at: '2012-01-01T04:06:07.000Z',
        updated_at: '2011-01-01T04:26:07.000Z',
      },
    },
    {
      type: 'official_feedback',
      id: 'feedbackId2',
      attributes: {
        author_multiloc: {
          en: 'Testing Official Department',
        },
        body_multiloc: {
          en: 'This is an important official communication from the testing department. Keep calm and read on.',
        },
        created_at: '2010-01-01T04:06:07.000Z',
        updated_at: '2000-01-01T04:06:07.000Z',
      },
    },
  ],
} as IOfficialFeedbacks;
