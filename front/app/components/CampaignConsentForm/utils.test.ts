import { groupConsentCampaigns } from './utils';

const campaignsConsentData = {
  1: {
    consented: false,
    content_type: 'A',
    campaign_type_description: '1a',
  },
  2: {
    consented: true,
    content_type: 'B',
    campaign_type_description: '2b',
  },
  3: {
    consented: true,
    content_type: 'C',
    campaign_type_description: '3c',
  },
  4: {
    consented: false,
    content_type: 'B',
    campaign_type_description: '4b',
  },
};

const expectedGroupedData = {
  A: {
    children: [
      {
        id: '1',
        consented: false,
        content_type: 'A',
        campaign_type_description: '1a',
      },
    ],
    group_consented: false,
  },
  B: {
    children: [
      {
        id: '2',

        consented: true,
        content_type: 'B',
        campaign_type_description: '2b',
      },
      {
        id: '4',
        consented: false,
        content_type: 'B',
        campaign_type_description: '4b',
      },
    ],
    group_consented: 'mixed',
  },
  C: {
    children: [
      {
        id: '3',
        consented: true,
        content_type: 'C',
        campaign_type_description: '3c',
      },
    ],
    group_consented: true,
  },
};

describe('groupConsentCampaigns', () => {
  it('should return the same schema and data if no elements are hidden', () => {
    const groupedData = groupConsentCampaigns(campaignsConsentData);

    expect(groupedData).toEqual(expectedGroupedData);
  });
});
