import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';

import SelectMethodModal from './SelectMethodModal';

// The modal behind "Add a phase or survey": pick a phase on the timeline
// and its participation method, or a standalone survey, then continue to
// the new phase's build view.

const meta = {
  title: 'Components/Redesigned/Setup panel/Select method modal',
  tags: ['bo', 'redesigned'],
  component: SelectMethodModal,
  parameters: { layout: 'fullscreen' },
  args: { projectId: project1.id, opened: true, onClose: fn() },
  decorators: [
    (Story) => (
      <div style={{ height: 900 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Continue');
  },
} satisfies Meta<typeof SelectMethodModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On the timeline: the participation methods to pick from. */
export const Default: Story = {};

/** The Standalone tab: a survey outside the timeline. */
export const Standalone: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Continue');
    const tabs = await within(canvasElement).findAllByRole('tab');
    await userEvent.click(tabs[1]);
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
