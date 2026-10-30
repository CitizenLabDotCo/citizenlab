import React from 'react';

import { emailCampaignsData } from 'api/campaigns/email/__mocks__/useEmailCampaigns';
import { IEmailCampaign } from 'api/campaigns/email/types';

import { render, screen } from 'utils/testUtils/rtl';

import FromTo from './FromTo';

jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('api/users/useUserById');

const makeCampaign = (
  sender: 'author' | 'organization',
  author: IEmailCampaign['data']['relationships']['author']
): IEmailCampaign => ({
  data: {
    ...emailCampaignsData[0],
    attributes: {
      ...emailCampaignsData[0].attributes,
      campaign_name: 'manual',
      sender,
    },
    relationships: {
      ...emailCampaignsData[0].relationships,
      author,
    },
  },
});

describe('<FromTo />', () => {
  it('shows the author as sender', () => {
    render(
      <FromTo
        campaign={makeCampaign('author', {
          data: { id: 'author', type: 'user' },
        })}
      />
    );

    expect(screen.getByText('Test Go Vocal')).toBeInTheDocument();
  });

  // Deleting a user clears the author of their campaigns and switches
  // the sender to the organization.
  it('shows the organization as sender when the author was deleted', () => {
    render(<FromTo campaign={makeCampaign('organization', { data: null })} />);

    expect(screen.getByText('Wonderville')).toBeInTheDocument();
  });
});
