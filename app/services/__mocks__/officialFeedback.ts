import { IOfficialFeedback } from 'services/officialFeedback';

export const mockOfficialFeedback = {
  data: [
    {
      type: 'official_feedbacks',
      id: 'feedbackId1',
      attributes: {
        author_multiloc: {
          en: 'Testing Official Department',
        },
        body_multiloc: {
          en: 'Update: Do Not Keep Calm, please panic now. End of transmission.',
        },
        created_at: 'Some time ago',
        updated_at: 'Some shorter time ago'
      }
    },
    {
      type: 'official_feedbacks',
      id: 'feedbackId2',
      attributes: {
        author_multiloc: {
          en: 'Testing Official Department',
        },
        body_multiloc: {
          en: 'This is an important official communication from the testing department. Keep calm and read on.',
        },
        created_at: 'Some longer time ago',
        updated_at: 'Some longer shorter time ago'
      }
    }
  ]
} as IOfficialFeedback;
