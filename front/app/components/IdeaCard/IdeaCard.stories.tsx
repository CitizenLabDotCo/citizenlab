import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { VotingContext } from 'api/baskets_ideas/useVoting';
import {
  votingIdeaHandler,
  votingResultsIdeaHandler,
} from 'api/ideas/__mocks__/_mockServer';
import {
  budgetingPastNoResultPhaseHandler,
  votingPastNoResultPhaseHandler,
  votingPhaseHandler,
} from 'api/phases/__mocks__/_mockServer';
import { votingProjectHandler } from 'api/projects/__mocks__/_mockServer';

import mockEndpoints from 'utils/storybook/mockEndpoints';

import IdeaCard, { Props } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const IdeaCards = (props: Props) => {
  const smallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      w="100%"
      h="100%"
      maxWidth="1166px"
      maxHeight="240px"
      display="flex"
      flexDirection={smallerThanPhone ? 'column' : 'row'}
    >
      <Box p="10px" width={smallerThanPhone ? '100%' : '50%'}>
        <IdeaCard {...props} />
      </Box>
      <Box p="10px" width={smallerThanPhone ? '100%' : '50%'}>
        <IdeaCard {...props} />
      </Box>
    </Box>
  );
};

const meta = {
  title: 'Cards/IdeaCard',
  component: IdeaCard,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof IdeaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  render: (props) => <IdeaCards {...props} />,
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
      <IdeaCards {...props} />
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

export const PastVotingNoResultSharing: Story = {
  render: (props) => (
    <VotingContext projectId="1">
      <IdeaCards {...props} />
    </VotingContext>
  ),
  args: {
    ...Standard.args,
    phaseId: 'ph1',
  },
  parameters: {
    msw: mockEndpoints({
      'GET projects/:id': votingProjectHandler,
      'GET ideas/:id': votingResultsIdeaHandler,
      'GET phases/:id': votingPastNoResultPhaseHandler,
    }),
  },
};

export const PastBudgetingNoResultSharing: Story = {
  render: (props) => (
    <VotingContext projectId="1">
      <IdeaCards {...props} />
    </VotingContext>
  ),
  args: {
    ...Standard.args,
    phaseId: 'ph1',
  },
  parameters: {
    msw: mockEndpoints({
      'GET projects/:id': votingProjectHandler,
      'GET ideas/:id': votingResultsIdeaHandler,
      'GET phases/:id': budgetingPastNoResultPhaseHandler,
    }),
  },
};
