import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import { timelineAndPhasesHandlers } from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import SurveyMethodSection from './SurveyMethodSection';

// The choice of survey kind in the build panel of a survey phase: a survey
// built on the platform, an external survey or a poll.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Survey method section',
  tags: ['bo', 'redesigned'],
  component: SurveyMethodSection,
  parameters: { msw: timelineAndPhasesHandlers },
  args: { selected: 'native_survey', onSelect: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'External');
  },
} satisfies Meta<typeof SurveyMethodSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A survey built on the platform, picked. */
export const Default: Story = {};

/** A poll, picked. */
export const Poll: Story = {
  args: { selected: 'poll' },
};

/** The survey has responses: the other kinds are locked, with the reason. */
export const Locked: Story = {
  args: {
    disabledReasons: {
      survey: 'This survey already has responses.',
      poll: 'This survey already has responses.',
    },
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
