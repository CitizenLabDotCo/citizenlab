import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import AdminOnlyPlaceholder from './AdminOnlyPlaceholder';

// The dashed box in the event preview that stands in for a part the admin
// hasn't filled in yet (the image, the description). Participants never
// see it.

const meta = {
  title: 'Components/Redesigned/Events/Admin only placeholder',
  tags: ['bo', 'redesigned'],
  component: AdminOnlyPlaceholder,
  args: { title: 'Event image' },
  decorators: [
    (Story) => (
      <div style={{ width: 343, padding: 16, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdminOnlyPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Where the event image will go. */
export const Default: Story = {};

/** Where the description will go. */
export const Description: Story = {
  args: { title: 'Event description' },
};

export const LongContent: Story = {
  args: {
    title:
      'A placeholder title long enough to wrap over more than one line in the phone preview',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
