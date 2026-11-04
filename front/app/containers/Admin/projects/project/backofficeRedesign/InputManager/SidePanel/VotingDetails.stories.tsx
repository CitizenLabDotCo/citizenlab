import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import {
  backofficeRedesignHandlers,
  votingPhase,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import { managedIdea } from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import VotingDetails from './VotingDetails';

// The voting block of the input side panel: the cost and number of picks
// in a budgeting phase, and the offline votes of a voting phase. It shows
// nothing outside voting.

const budgetIdea = {
  ...managedIdea,
  attributes: { ...managedIdea.attributes, budget: 25000, baskets_count: 14 },
};

const meta = {
  title: 'Components/Redesigned/Input manager/Voting details',
  tags: ['bo', 'redesigned'],
  component: VotingDetails,
  parameters: { msw: backofficeRedesignHandlers },
  args: { idea: managedIdea, phase: votingPhase },
  decorators: [
    (Story) => (
      <div style={{ width: 592, maxWidth: '100%', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VotingDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A voting phase: offline votes. */
export const Default: Story = {};

/** A budgeting input: its cost and picks. */
export const Budget: Story = {
  args: { idea: budgetIdea, phase: undefined },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '14');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
