import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Box from '../Box';
import Title from '../Title';

import CollapsibleContainer from '.';

const meta = {
  title: 'Components/CollapsibleContainer',
  component: CollapsibleContainer,
} satisfies Meta<typeof CollapsibleContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpenByDefault: false,
    children: <Box>Some content in the collapsible container</Box>,
    title: (
      <Title variant="h3" fontSize="s" fontWeight="bold">
        Collapsible container title
      </Title>
    ),
    width: '800px',
  },
};
