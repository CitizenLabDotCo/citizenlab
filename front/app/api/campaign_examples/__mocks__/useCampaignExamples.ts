import { ICampaignExampleData } from '../types';

export const campaignExamplesData: ICampaignExampleData[] = [
  {
    id: '1',
    type: 'example',
    attributes: {
      locale: 'en',
      subject: 'You became an administrator on the platform of Liege',
      mail_body_html: '<html><body>Some email body</body></html>',
      created_at: '2023-03-03T09:00:00.000Z',
      updated_at: '2023-03-03T09:00:00.000Z',
    },
    relationships: {
      campaign: {
        data: {
          type: 'campaign',
          id: '1',
        },
      },
      recipient: {
        data: {
          type: 'user',
          id: '1',
        },
      },
    },
  },
  {
    id: '2',
    type: 'example',
    attributes: {
      locale: 'en',
      subject: 'You received a new reply on your comment',
      mail_body_html: '<html><body>Some other email body</body></html>',
      created_at: '2023-04-04T09:00:00.000Z',
      updated_at: '2023-04-04T09:00:00.000Z',
    },
    relationships: {
      campaign: {
        data: {
          type: 'campaign',
          id: '2',
        },
      },
      recipient: {
        data: {
          type: 'user',
          id: '1',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: campaignExamplesData } };
});
