import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import NewLabel from '.';

// The "New" badge next to a recently added admin feature. After its
// expiry date it renders nothing.
const meta = {
  title: 'Components/Data display/NewLabel',
  tags: ['bo'],
  parameters: { gv: {} },
  component: NewLabel,
  render: (args) => (
    <Box display="flex" alignItems="center" gap="8px" p="8px">
      <Text m="0px">Input manager</Text>
      <NewLabel {...args} />
    </Box>
  ),
} satisfies Meta<typeof NewLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
  render: (args) => (
    <Box display="flex" alignItems="center" gap="8px" p="8px">
      <Text m="0px">مدير المدخلات</Text>
      <NewLabel {...args} />
    </Box>
  ),
};
