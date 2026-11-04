import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import {
  ideationPhase,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  postingPermissionHandler,
  timelineAndPhasesHandlers,
} from '../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import EditAccessButton from './EditAccessButton';

// The button under a phase's method settings that opens who can take part
// in each action of the phase, in a modal.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Edit access button',
  tags: ['bo', 'redesigned'],
  component: EditAccessButton,
  parameters: {
    msw: [postingPermissionHandler, ...timelineAndPhasesHandlers],
  },
  args: { phaseId: ideationPhase.id },
  decorators: [
    (Story) => (
      <div style={{ width: 384, minHeight: 120, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Edit access');
  },
} satisfies Meta<typeof EditAccessButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The access modal, open. */
export const Open: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: 800 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Edit access');
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Edit access' })
    );
    await waitForText(document.body, 'Who can submit inputs?');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
