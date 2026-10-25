import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import PanelRow from './PanelRow';

// A setup panel row that leads somewhere: the 14px semibold label, a grey
// chevron on the right and a thin grey line above.

const meta = {
  title: 'Components/Redesigned/Settings panel/Panel row',
  tags: ['bo', 'redesigned'],
  component: PanelRow,
  args: { label: 'Participant actions', onClick: fn() },
  decorators: [
    (Story) => (
      <Box w="332px" px="16px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PanelRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A few rows stacked. */
export const List: Story = {
  render: (args) => (
    <>
      <PanelRow {...args} />
      <PanelRow {...args} label="Phase report" />
      <PanelRow {...args} label="Survey questions" />
    </>
  ),
};

export const LongContent: Story = {
  args: {
    label: 'Copy the ideas of the previous phase into this phase',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
