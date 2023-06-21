import { ITextingCampaignData } from '../types';

export const campaignsData: ITextingCampaignData[] = [
  {
    id: 'dbf5a843-8c03-4be5-8c8b-81cfc9ed7adf',
    type: 'campaign',
    attributes: {
      phone_numbers: ['+35900000000'],
      message: 'qewf',
      sent_at: null,
      status: 'draft',
      created_at: '2023-06-21T13:27:09.851Z',
      updated_at: '2023-06-21T13:27:09.851Z',
    },
  },
  {
    id: 'dbf5a843-8c03-4be5-8c8b-66565435',
    type: 'campaign',
    attributes: {
      phone_numbers: ['+35900000000'],
      message: 'qewfssdg',
      sent_at: null,
      status: 'draft',
      created_at: '2023-06-21T13:27:09.851Z',
      updated_at: '2023-06-21T13:27:09.851Z',
    },
  },
];

export const links = {
  self: 'http://localhost:3000/web_api/v1/texting_campaigns/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  last: 'http://localhost:3000/web_api/v1/texting_campaigns/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  next: 'http://localhost:3000/web_api/v1/texting_campaigns/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  first:
    'http://localhost:3000/web_api/v1/texting_campaigns/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  prev: null,
};

export default jest.fn(() => {
  return { data: { data: campaignsData, links } };
});
