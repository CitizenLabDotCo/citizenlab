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
    isOpenByDefault: false,
    children: <Box>Some content in the collapsible container</Box>,
    title: 'Title of a collapsible container',
    titleAs: 'h3',
    titleVariant: 'h3',
    titleFontSize: 's',
    width: '800px',
  },
};
