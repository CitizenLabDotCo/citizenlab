import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Box from '../Box';
import IconTooltip from '../IconTooltip';
import Title from '../Title';

import Accordion from '.';

const meta = {
  title: 'Components/Layout/Accordion',
  tags: ['shared'],
  parameters: { gv: {} },
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
    width: '800px',
  },
};

// The title button carries the hover style (the chevron turns black).
export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['button[aria-expanded]'] } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focusVisible: ['button[aria-expanded]'] } },
};

export const Open: Story = {
  args: { ...Default.args, isOpenByDefault: true },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    isOpenByDefault: true,
    width: '400px',
    title: (
      <Title variant="h3">
        How the participatory budget is divided between the districts this year
      </Title>
    ),
    children:
      'Every district receives a base amount. The rest is divided by the number of residents, so larger districts receive more. The council checks the division each spring before the voting phase starts.',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    ...Default.args,
    isOpenByDefault: true,
    title: <Title variant="h3">عنوان القسم</Title>,
    children: 'محتوى القسم.',
  },
};
