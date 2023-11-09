import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import mockEndpoints from 'utils/storybook/mockEndpoints';
import { votingProjectHandler } from 'api/projects/__mocks__/_mockServer';
import { votingIdeaHandler } from 'api/ideas/__mocks__/_mockServer';
import { VotingContext } from 'api/baskets_ideas/useVoting';

import IdeaCard from '.';

const meta = {
  title: 'Example/IdeaCard',
  render: (props) => (
    <div style={{ maxWidth: '700px' }}>
      <IdeaCard {...props} />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof IdeaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    ideaId: '1',
    showFollowButton: false,
  },
  parameters: {},
};

export const Voting: Story = {
  render: (props) => (
    <VotingContext projectId="1">
      <div style={{ width: '700px' }}>
        <IdeaCard {...props} />
      </div>
    </VotingContext>
  ),
  args: {
    ideaId: '1',
  },
  parameters: {
    msw: mockEndpoints({
      'GET projects/:id': votingProjectHandler,
      'GET ideas/:id': votingIdeaHandler,
    }),
  },
};
