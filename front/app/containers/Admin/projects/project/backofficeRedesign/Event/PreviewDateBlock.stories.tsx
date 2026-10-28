import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import PreviewDateBlock from './PreviewDateBlock';

// The big day, month and time at the top of the event preview's
// information card.

const meta = {
  title: 'Components/Redesigned/Events/Preview date block',
  tags: ['bo', 'redesigned'],
  component: PreviewDateBlock,
  args: { day: '06', month: 'Nov', time: '10:00 AM' },
  decorators: [
    (Story) => (
      <div style={{ width: 120, padding: 16, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PreviewDateBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A 24-hour time, as many locales show it. */
export const TwentyFourHour: Story = {
  args: { day: '28', month: 'déc.', time: '18:30' },
};

export const RTL: Story = {
  args: { day: '٠٦', month: 'نوفمبر', time: '10:00 ص' },
  globals: { lang: 'ar' },
};
