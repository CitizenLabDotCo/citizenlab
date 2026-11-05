import React from 'react';

import { emailCampaignsData } from 'api/campaigns/email/__mocks__/useEmailCampaigns';
import { IEmailCampaign } from 'api/campaigns/email/types';

import { render, screen } from 'utils/testUtils/rtl';

import Show from '.';

jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('api/projects/useProjectById');
jest.mock('api/users/useUserById');

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ projectId: 'project-id', campaignId: '1' }),
  useSearch: () => ({}),
}));

let mockCampaign: IEmailCampaign;
jest.mock('api/campaigns/email/useEmailCampaign', () =>
  jest.fn(() => ({ data: mockCampaign }))
);

// These need a router or their own data, and the sender line doesn't depend on them.
jest.mock('components/UI/GoBackButton', () => () => null);
jest.mock('components/UI/ButtonWithLink', () => () => null);
jest.mock('components/admin/Email/Scheduling', () => () => null);
jest.mock('components/admin/Email/DraftCampaignDetails', () => () => null);

const makeCampaign = (
  sender: 'author' | 'organization',
  author: IEmailCampaign['data']['relationships']['author']
): IEmailCampaign => ({
  data: {
    ...emailCampaignsData[0],
    attributes: {
      ...emailCampaignsData[0].attributes,
      campaign_name: 'manual_project_participants',
      sender,
    },
    relationships: {
      ...emailCampaignsData[0].relationships,
      author,
    },
  },
});

describe('<Show />', () => {
  it('shows the author as sender', () => {
    mockCampaign = makeCampaign('author', {
      data: { id: 'author', type: 'user' },
    });

    render(<Show />);

    expect(screen.getByText('Test Go Vocal')).toBeInTheDocument();
  });

  // Deleting a user clears the author of their campaigns and switches
  // the sender to the organization.
  it('shows the organization as sender when the author was deleted', () => {
    mockCampaign = makeCampaign('organization', { data: null });

    render(<Show />);

    expect(screen.getByText('Wonderville')).toBeInTheDocument();
  });
});
