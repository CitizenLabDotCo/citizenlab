import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  ideationPhase,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  inputManagerHandlers,
  managedIdea,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import IdeaOverview from './IdeaOverview';

// The body of the input side panel in view mode: title, author and date,
// reactions and quick actions, the editable properties, the input's
// content, the official reply and the comments.

const meta = {
  title: 'Components/Redesigned/Input manager/Idea overview',
  tags: ['bo', 'redesigned'],
  component: IdeaOverview,
  parameters: { msw: inputManagerHandlers },
  args: {
    idea: managedIdea,
    type: 'ProjectIdeas',
    listedPhase: ideationPhase,
    onEdit: fn(),
    onDeleted: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640, maxWidth: '100%', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Plant oaks along the canal');
  },
} satisfies Meta<typeof IdeaOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A proposal: no dislikes and no phases. */
export const Proposal: Story = {
  args: { type: 'ProjectProposals' },
};

/** Listed under all phases. */
export const AllPhases: Story = {
  args: { listedPhase: undefined },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
