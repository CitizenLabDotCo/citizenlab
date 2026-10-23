import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import Centerer from '.';

// A full-width flex box that centres its content; extra Box props pass
// through (here a height and a background, to show the centring).
const meta = {
  title: 'Components/Layout/Centerer',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Centerer,
  render: (args) => (
    <Box width="600px" p="8px">
      <Centerer {...args} />
    </Box>
  ),
} satisfies Meta<typeof Centerer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    height: '200px',
    bg: '#f4f4f6',
    children: (
      <Box bg="white" px="16px" py="8px" borderRadius="3px">
        <Text m="0px">Centred content</Text>
      </Box>
    ),
  },
};
