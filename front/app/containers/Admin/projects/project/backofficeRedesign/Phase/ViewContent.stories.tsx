import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  ideationPhase,
  votingPhase,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { timelineAndPhasesHandlers } from '../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import ViewContent from './ViewContent';

// The body of a phase's Manage or Insights tab: the tab's own content once
// the phase has participation, or an empty state with offline collection
// or a hint beside it until then.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/View content',
  tags: ['bo', 'redesigned'],
  component: ViewContent,
  parameters: { layout: 'fullscreen', msw: timelineAndPhasesHandlers },
  args: {
    project: project1,
    phase: votingPhase,
    view: 'manage',
    children: (
      <Box flexGrow={1} p="24px" background={colors.white}>
        <Text m="0">The input manager shows here.</Text>
      </Box>
    ),
  },
  decorators: [
    (Story) => (
      <Box
        display="flex"
        gap="12px"
        height="640px"
        p="12px"
        background={colors.grey100}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ViewContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Manage tab, no inputs yet: offline collection beside the empty state. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'No inputs yet');
  },
};

/** Insights tab, nothing to show yet. */
export const InsightsEmpty: Story = {
  args: { view: 'insights' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'No insights yet');
  },
};

/** The phase has inputs: the tab's own content. */
export const WithContent: Story = {
  args: { phase: ideationPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'The input manager shows here.');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
