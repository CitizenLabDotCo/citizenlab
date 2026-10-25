import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import PanelRowButton from './PanelRowButton';

// The button inside every setup panel row: a transparent full-width row,
// the 14px semibold label and a 16px grey icon on the right (chevron right
// for a row, chevron down for an open group).

const meta = {
  title: 'Components/Redesigned/Settings panel/Panel row button',
  tags: ['bo', 'redesigned'],
  component: PanelRowButton,
  args: { label: 'Listing', icon: 'chevron-right', onClick: fn() },
  decorators: [
    (Story) => (
      <Box w="332px" px="16px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PanelRowButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** As the title of an open group. */
export const Expanded: Story = {
  args: { icon: 'chevron-down', ariaExpanded: true },
};

export const LongContent: Story = {
  args: {
    label: 'Who can find the project and who can take part in its phases',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
