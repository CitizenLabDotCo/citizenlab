import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import PanelHeading from './PanelHeading';

// The small grey heading over each block of the setup panel (Get started,
// Next actions, Areas), with an optional count on the right.

const meta = {
  title: 'Components/Redesigned/Setup panel/Panel heading',
  tags: ['bo', 'redesigned'],
  component: PanelHeading,
  args: { title: 'Get started', meta: '2 of 5 done' },
  decorators: [
    (Story) => (
      <div style={{ width: 292, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A heading with its count. */
export const Default: Story = {};

/** Just the heading. */
export const TitleOnly: Story = {
  args: { title: 'Next actions', meta: undefined },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
