import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Box from '../Box';
import IconTooltip from '../IconTooltip';
import Title from '../Title';

import Accordion from '.';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    timeoutMilliseconds: 1500,
    transitionHeightPx: 600,
    title: (
      <Box display="flex">
        <Title variant="h3">Section Title</Title>
        <IconTooltip
          m="8px"
          mt="16px"
          icon="info-solid"
          content="Tooltip content."
        />
      </Box>
    ),
    isOpenByDefault: false,
    children: 'Content for the section.',
  },
};
