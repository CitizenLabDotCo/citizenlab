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
      <Title fontSize="s" variant="h3">
        Title of a collapsible container
      </Title>
    ),
    width: '800px',
  },
};
