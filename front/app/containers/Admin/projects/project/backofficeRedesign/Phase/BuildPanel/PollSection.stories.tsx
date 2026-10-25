import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  pollPhase,
  timelineAndPhasesHandlers,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import PollSection from './PollSection';

// The poll part of the phase build panel: a button that opens the poll's
// questions in a modal.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Poll section',
  tags: ['bo', 'redesigned'],
  component: PollSection,
  parameters: { msw: timelineAndPhasesHandlers },
  args: { phaseId: pollPhase.id },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Poll questions');
  },
} satisfies Meta<typeof PollSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The poll questions modal, open. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Add questions');
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add questions' })
    );
    await waitForText(document.body, 'When should the library open');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
