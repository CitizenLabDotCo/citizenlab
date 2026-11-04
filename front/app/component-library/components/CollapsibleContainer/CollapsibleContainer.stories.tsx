import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Box from '../Box';

import CollapsibleContainer from '.';

const meta = {
  title: 'Components/Layout/CollapsibleContainer',
  tags: ['shared'],
  parameters: { gv: {} },
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

// The title button carries the focus style. Its hover sets the chevron to
// black, which it already is, so there is no visible Hover state.
export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focusVisible: ['button'] } },
};

export const Open: Story = {
  args: { ...Default.args, isOpenByDefault: true },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    isOpenByDefault: true,
    width: '400px',
    title: 'Which documents do I need to bring to the information evening?',
    children: (
      <Box>
        Bring an identity document and, if you live outside the project area,
        a proof of address. You can also register online beforehand, in which
        case the confirmation email is enough to get in.
      </Box>
    ),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    ...Default.args,
    isOpenByDefault: true,
    title: 'عنوان القسم',
    children: <Box>محتوى القسم.</Box>,
  },
};
