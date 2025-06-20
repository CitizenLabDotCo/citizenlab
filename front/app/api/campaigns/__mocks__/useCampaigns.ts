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
      campaign_name: 'official_feedback_on_idea_you_follow',
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
      has_preview: false,
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
      campaign_name: 'official_feedback_on_idea_you_follow',
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
      has_preview: false,
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

export const links = {
  self: 'http://localhost:3000/web_api/v1/campaigns?depth=0\u0026page%5Bnumber%5D=1\u0026page%5Bsize%5D=1000\u0026publication_statuses%5B%5D=published\u0026publication_statuses%5B%5D=archived\u0026remove_not_allowed_parents=true',
  first:
    'http://localhost:3000/web_api/v1/campaigns?depth=0\u0026page%5Bnumber%5D=1\u0026page%5Bsize%5D=1000\u0026publication_statuses%5B%5D=published\u0026publication_statuses%5B%5D=archived\u0026remove_not_allowed_parents=true',
  last: 'http://localhost:3000/web_api/v1/campaigns?depth=0\u0026page%5Bnumber%5D=2\u0026page%5Bsize%5D=1000\u0026publication_statuses%5B%5D=published\u0026publication_statuses%5B%5D=archived\u0026remove_not_allowed_parents=true',
  prev: null,
  next: 'http://localhost:3000/web_api/v1/campaigns?depth=0\u0026page%5Bnumber%5D=2\u0026page%5Bsize%5D=1000\u0026publication_statuses%5B%5D=published\u0026publication_statuses%5B%5D=archived\u0026remove_not_allowed_parents=true',
};
