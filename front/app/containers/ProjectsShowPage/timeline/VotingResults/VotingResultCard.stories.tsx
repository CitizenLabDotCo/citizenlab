import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { VotingContext } from 'api/baskets_ideas/useVoting';
import {
  ideaDataWithVotes,
  votingResultsIdeaHandler,
} from 'api/ideas/__mocks__/_mockServer';
import { votingPhaseHandler } from 'api/phases/__mocks__/_mockServer';
import { votingProjectHandler } from 'api/projects/__mocks__/_mockServer';

import VotingResultCard from 'containers/ProjectsShowPage/timeline/VotingResults/VotingResultCard';

import mockEndpoints from 'utils/storybook/mockEndpoints';

import type { Meta, StoryObj } from '@storybook/react';

const VotingResultCards = () => {
  const smallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      w="100%"
      h="100%"
      maxWidth="1166px"
      display="flex"
      flexDirection={smallerThanPhone ? 'column' : 'row'}
    >
      <Box p="10px" width={smallerThanPhone ? '100%' : '50%'}>
        <VotingResultCard
          idea={ideaDataWithVotes[0]}
          phaseId={'ph1'}
          rank={1}
        />
      </Box>
      <Box p="10px" width={smallerThanPhone ? '100%' : '50%'}>
        <VotingResultCard
          idea={ideaDataWithVotes[1]}
          phaseId={'ph1'}
          rank={2}
        />
      </Box>
    </Box>
  );
};

const meta = {
  title: 'Cards/VotingResultCard',
  component: VotingResultCard,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof VotingResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AutoshareEnabled: Story = {
  render: () => (
    <VotingContext projectId="1">
      <VotingResultCards />
    </VotingContext>
  ),
  args: {
    idea: ideaDataWithVotes[0],
    phaseId: 'ph1',
    rank: 1,
  },
  parameters: {
    msw: mockEndpoints({
      'GET projects/:id': votingProjectHandler,
      'GET ideas/:id': votingResultsIdeaHandler,
      'GET phases/:id': votingPhaseHandler,
    }),
  },
};
