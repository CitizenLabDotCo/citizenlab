import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  noCausesHandler,
  timelineAndPhasesHandlers,
  volunteeringPhase,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import CausesSection from './CausesSection';

// The volunteering part of the phase build panel: the causes people can
// sign up for, and a button to add one in a modal.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Causes section',
  tags: ['bo', 'redesigned'],
  component: CausesSection,
  parameters: { msw: timelineAndPhasesHandlers },
  args: { phaseId: volunteeringPhase.id },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Dig the planting holes');
  },
} satisfies Meta<typeof CausesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three causes. */
export const Default: Story = {};

/** No causes yet. */
export const Empty: Story = {
  parameters: { msw: [noCausesHandler, ...timelineAndPhasesHandlers] },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Causes');
  },
};

/** The new cause modal, open. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Dig the planting holes');
    const buttons = within(canvasElement).getAllByRole('button');
    await userEvent.click(buttons[buttons.length - 1]);
    await waitForText(document.body, 'Title');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
