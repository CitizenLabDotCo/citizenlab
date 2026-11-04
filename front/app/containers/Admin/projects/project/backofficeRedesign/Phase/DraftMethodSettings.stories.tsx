import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  ideationPhase,
  infoPhase,
  votingPhase,
  waitForText,
  withAllLocales,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  surveyPhase,
  timelineAndPhasesHandlers,
} from '../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import DraftMethodSettings from './DraftMethodSettings';

// The method settings of a phase being added, before it is saved: the
// method's options, and a note that the rest comes once it is saved.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Draft method settings',
  tags: ['bo', 'redesigned'],
  component: DraftMethodSettings,
  parameters: { msw: timelineAndPhasesHandlers },
  args: {
    formData: ideationPhase.attributes,
    validationErrors: {},
    apiErrors: null,
    onChange: fn(),
    setValidationErrors: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560, background: 'white' }}>
        <Story />
      </div>
    ),
    withAllLocales,
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'once you save the phase');
  },
} satisfies Meta<typeof DraftMethodSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new ideation phase. */
export const Default: Story = {};

/** A new voting phase: the voting options. */
export const Voting: Story = {
  args: { formData: votingPhase.attributes },
};

/** A new survey. */
export const Survey: Story = {
  args: { formData: surveyPhase.attributes },
};

/** A new information phase: nothing to set before saving. */
export const Information: Story = {
  args: { formData: infoPhase.attributes },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
