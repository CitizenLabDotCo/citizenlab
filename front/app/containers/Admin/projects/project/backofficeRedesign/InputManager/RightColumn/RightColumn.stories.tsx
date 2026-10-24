import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ideaStatusesData } from 'api/idea_statuses/__mocks__/_mockServer';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  votingPhase,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import RightColumn from '.';

// The column beside the input list: stat tiles, inputs awaiting a reply,
// offline collection and exports.

const meta = {
  title: 'Components/Redesigned/Input manager right column',
  tags: ['bo'],
  component: RightColumn,
  parameters: { msw: backofficeRedesignHandlers },
  args: {
    type: 'ProjectIdeas',
    project: project1,
    phase: ideationPhase,
    counts: {
      total: 12,
      byStatus: { 1: 8, 2: 4 },
      byTopic: {},
      byAssignee: undefined,
      awaiting: 5,
      replied: 7,
      imported: 2,
      online: 10,
    },
    statuses: ideaStatusesData,
    selectedIds: [],
    onShowAwaitingReply: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Exports');
  },
} satisfies Meta<typeof RightColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An ideation phase. */
export const Default: Story = {};

/** A voting phase. */
export const Voting: Story = {
  args: { phase: votingPhase },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '12');
  },
};
