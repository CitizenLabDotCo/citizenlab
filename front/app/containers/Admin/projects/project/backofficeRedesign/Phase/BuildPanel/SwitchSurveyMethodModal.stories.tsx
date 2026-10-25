import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  waitForText,
  withAllLocales,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  externalSurveyPhase,
  pollPhase,
  surveyPhase,
  timelineAndPhasesHandlers,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import SwitchSurveyMethodModal from './SwitchSurveyMethodModal';

// The confirmation before a survey phase changes kind (platform survey,
// external survey, poll): what the switch will lose.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Switch survey method modal',
  tags: ['bo', 'redesigned'],
  component: SwitchSurveyMethodModal,
  parameters: { msw: timelineAndPhasesHandlers },
  args: { phase: surveyPhase, method: 'survey', onClose: fn() },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 600 }}>
        <Story />
      </div>
    ),
    withAllLocales,
  ],
  play: async () => {
    await waitForText(document.body, 'Change the kind of survey?');
  },
} satisfies Meta<typeof SwitchSurveyMethodModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** From a platform survey to an external one: the survey form is hidden. */
export const Default: Story = {};

/** From an external survey to a poll: the embed link is cleared. */
export const FromExternalSurvey: Story = {
  args: { phase: externalSurveyPhase, method: 'poll' },
};

/** From a poll to a platform survey. */
export const FromPoll: Story = {
  args: { phase: pollPhase, method: 'native_survey' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
