import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import SearchToggle from './SearchToggle';

// The search of the input list: a magnifier button that opens into a
// search field, and stays open while a search is on.

const meta = {
  title: 'Components/Redesigned/Input manager/Search toggle',
  tags: ['bo', 'redesigned'],
  component: SearchToggle,
  args: { searchTerm: undefined, onChange: fn(), resultCount: 2 },
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
} satisfies Meta<typeof SearchToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the magnifier button. */
export const Default: Story = {};

/** Opened, before typing. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Search inputs' })
    );
  },
};

/** A search is on. */
export const WithSearchTerm: Story = {
  args: { searchTerm: 'canal' },
};

export const RTL: Story = {
  args: { searchTerm: 'canal' },
  globals: { lang: 'ar' },
};
