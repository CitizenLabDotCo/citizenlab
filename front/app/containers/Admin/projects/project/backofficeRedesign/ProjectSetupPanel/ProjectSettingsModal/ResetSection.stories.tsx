import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import ResetSection from './ResetSection';

// The "reset participation data" block at the bottom of the general
// settings: a warning and a red button that asks to confirm first.

const meta = {
  title: 'Components/Redesigned/Setup panel/Reset section',
  tags: ['bo', 'redesigned'],
  component: ResetSection,
  args: { projectId: project1.id },
  decorators: [
    (Story) => (
      <div style={{ width: 560, maxWidth: '100%', padding: 24, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResetSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The warning and the reset button. */
export const Default: Story = {};

/** After clicking reset: the confirm modal. */
export const Confirm: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 600 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button');
    await userEvent.click(button);
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
