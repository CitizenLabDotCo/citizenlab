import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Box from '../Box';

import CollapsibleContainer from '.';

const meta = {
  title: 'Components/CollapsibleContainer',
  component: CollapsibleContainer,
} satisfies Meta<typeof CollapsibleContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Sort by',
    isOpenByDefault: false,
    children: <Box>Some content</Box>,
    width: '800px',
  },
};
