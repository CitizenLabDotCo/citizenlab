import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import PlatformTimeNote from './PlatformTimeNote';

// The small note under the event dates that says they are in the
// platform's time zone. Hovering it shows the offset from GMT.

const meta = {
  title: 'Components/Redesigned/Events/Platform time note',
  tags: ['bo', 'redesigned'],
  component: PlatformTimeNote,
  args: { timezone: 'Europe/Brussels', now: new Date('2026-10-25T10:00:00Z') },
  decorators: [
    (Story) => (
      <div style={{ width: 260, padding: 18, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformTimeNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
  args: { timezone: 'America/Argentina/Buenos_Aires' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
