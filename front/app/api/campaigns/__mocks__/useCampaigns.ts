import { ICampaignData } from '../types';

export const campaignsData: ICampaignData[] = [
  {
    id: '1',
    type: 'campaign',
    attributes: {
      enabled: true,
      sender: 'author',
      reply_to: 'author',
      subject_multiloc: {
        en: "We're almost done with your feedback",
      },
      body_multiloc: {
        en: 'Time to check it all out!',
      },
      created_at: '2021-03-03T09:00:00.000Z',
      updated_at: '2021-03-03T09:00:00.000Z',
      campaign_name: 'campaign_name',
      campaign_description_multiloc: {
        en: 'Weekly overview of your own proposals',
      },
      deliveries_count: 0,
      schedule: null,
      schedule_multiloc: {
        en: 'Weekly, on Wednesdays at 2 PM',
      },
      content_type_multiloc: {},
      content_type_ordering: 1,
      recipient_role_multiloc: {},
      recipient_role_ordering: 1,
      recipient_segment_multiloc: {},
      trigger_multiloc: {},
    },
    relationships: {
      author: {
        data: { id: 'author', type: 'user' },
      },
      groups: {
        data: [{ id: 'group1', type: 'group' }],
      },
    },
  },
  {
    id: '2',
    type: 'campaign',
    attributes: {
      enabled: true,
      sender: 'author',
      reply_to: 'author',
      subject_multiloc: {
        en: "We're almost done with your feedback",
      },
      body_multiloc: {
        en: 'Time to check it all out!',
      },
      created_at: '2021-03-03T09:00:00.000Z',
      updated_at: '2021-03-03T09:00:00.000Z',
      campaign_name: 'campaign_name',
      campaign_description_multiloc: {
        en: 'Weekly overview of your own proposals',
      },
      deliveries_count: 0,
      schedule: null,
      schedule_multiloc: {
        en: 'Weekly, on Wednesdays at 2 PM',
      },
      content_type_multiloc: {},
      content_type_ordering: 1,
      recipient_role_multiloc: {},
      recipient_role_ordering: 1,
      recipient_segment_multiloc: {},
      trigger_multiloc: {},
    },
    relationships: {
      author: {
        data: { id: 'author', type: 'user' },
      },
      groups: {
        data: [{ id: 'group1', type: 'group' }],
      },
    },
  },
];
