import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import ToolbarIconButton from './ToolbarIconButton';

// A square icon-only button of the input list toolbar (search, filter) and
// the side panel's quick actions, with a tooltip naming it. A dot shows
// that something is on, such as an active filter.

const meta = {
  title: 'Components/Redesigned/Input manager/Toolbar icon button',
  tags: ['bo', 'redesigned'],
  component: ToolbarIconButton,
  args: { icon: 'filter', label: 'Filter', onClick: fn() },
  decorators: [
    // At the right end of the list toolbar, as in the page.
    (Story) => (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="480px"
        maxWidth="100%"
      >
        <Text variant="boLabel" m="0">
          12 inputs
        </Text>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ToolbarIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Its menu is open. */
export const Active: Story = {
  args: { active: true },
};

/** A filter is on. */
export const WithDot: Story = {
  args: { showDot: true },
};

export const Search: Story = {
  args: { icon: 'search', label: 'Search inputs' },
};

export const RTL: Story = {
  args: { showDot: true },
  globals: { lang: 'ar' },
};
