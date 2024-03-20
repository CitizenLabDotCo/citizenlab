import React from 'react';

import { VotingContext } from 'api/baskets_ideas/useVoting';
import { votingIdeaHandler } from 'api/ideas/__mocks__/_mockServer';
import { votingPhaseHandler } from 'api/phases/__mocks__/_mockServer';
import { votingProjectHandler } from 'api/projects/__mocks__/_mockServer';

import mockEndpoints from 'utils/storybook/mockEndpoints';

import IdeaCard from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Example/IdeaCard',
  render: (props) => (
    <div style={{ maxWidth: '700px' }}>
      <IdeaCard {...props} />
    </div>
  ),
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof IdeaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    ideaId: '1',
    showFollowButton: false,
    hideImage: false,
    hideImagePlaceholder: false,
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
    ...Standard.args,
    phaseId: 'ph1',
  },
  parameters: {
    msw: mockEndpoints({
      'GET projects/:id': votingProjectHandler,
      'GET ideas/:id': votingIdeaHandler,
      'GET phases/:id': votingPhaseHandler,
    }),
  },
};
