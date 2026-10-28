import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  ideationPhase,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  phaseRoute,
  timelineAndPhasesHandlers,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import PhaseDates from './PhaseDates';

// The dates field of the phase build panel: the phase's start and end on a
// calendar next to the project's other phases.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Phase dates',
  tags: ['bo', 'redesigned'],
  component: PhaseDates,
  parameters: { msw: timelineAndPhasesHandlers },
  args: {
    formData: ideationPhase.attributes,
    errors: null,
    validationErrors: {},
    standalone: false,
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
    phaseRoute(ideationPhase.id),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Dates');
  },
} satisfies Meta<typeof PhaseDates>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A phase on the timeline. */
export const Default: Story = {};

/** A phase outside the timeline: dates may overlap or stay open. */
export const Standalone: Story = {
  args: { standalone: true },
};

/** The dates clash with another phase. */
export const WithError: Story = {
  args: {
    validationErrors: {
      phaseDateError: 'This phase overlaps with "Choose the places".',
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'overlaps');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
