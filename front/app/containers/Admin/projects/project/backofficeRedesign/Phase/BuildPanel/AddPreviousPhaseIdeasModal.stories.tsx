import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  votingPhase,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import { timelineAndPhasesHandlers } from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import AddPreviousPhaseIdeasModal from './AddPreviousPhaseIdeasModal';

// The modal of a voting phase that brings in ideas from an earlier phase:
// the input manager, filtered by phase.

const meta = {
  title:
    'Components/Redesigned/Timeline and phases/Add previous phase ideas modal',
  tags: ['bo', 'redesigned'],
  component: AddPreviousPhaseIdeasModal,
  parameters: { msw: timelineAndPhasesHandlers },
  args: {
    projectId: project1.id,
    phaseId: votingPhase.id,
    opened: true,
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 900 }}>
        <Story />
      </div>
    ),
  ],
  play: async () => {
    await waitForText(document.body, 'Add ideas from previous phase');
  },
} satisfies Meta<typeof AddPreviousPhaseIdeasModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, with the ideas of the project. */
export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
