import React from 'react';

import Box from '../Box';

import ListItem from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Layout/ListItem',
  tags: ['shared'],
  parameters: { gv: {} },
  component: ListItem,
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// Adjacent list items share one border.
export const Default: Story = {
  render: () => (
    <Box width="400px">
      <ListItem py="12px">First item</ListItem>
      <ListItem py="12px">Second item</ListItem>
      <ListItem py="12px">Third item</ListItem>
    </Box>
  ),
};
