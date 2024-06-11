import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { VotingContext } from 'api/baskets_ideas/useVoting';
import { votingIdeaHandler } from 'api/ideas/__mocks__/_mockServer';
import { votingPhaseHandler } from 'api/phases/__mocks__/_mockServer';
import { votingProjectHandler } from 'api/projects/__mocks__/_mockServer';

import mockEndpoints from 'utils/storybook/mockEndpoints';

import IdeaCard, { Props } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const IdeaCards = (props: Props) => {
  const smallerThanPhone = useBreakpoint('phone');

  return (
    <Box w="100%" maxWidth="1166px" display="flex" flexDirection="row">
      <Box margin="10px" width={smallerThanPhone ? '100%' : 'calc(50% - 20px)'}>
        <IdeaCard {...props} />
      </Box>
      <Box margin="10px" width={smallerThanPhone ? '100%' : 'calc(50% - 20px)'}>
        <IdeaCard {...props} />
      </Box>
    </Box>
  );
};

const meta = {
  title: 'Example/IdeaCard',
  component: IdeaCard,
  parameters: {
    layout: 'centered',
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
