import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { mockFilterCategories } from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import FilterMenu from '.';

// The filter button of the input list and its menu: one row per filter
// (phase, source, status, assignee, tags, reply) that opens the list of
// its options.

const openMenu = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', {
      name: /Filter|تصفية/,
    })
  );
};

const meta = {
  title: 'Components/Redesigned/Input manager/Filter menu',
  tags: ['bo', 'redesigned'],
  component: FilterMenu,
  args: { categories: mockFilterCategories(), onClearAll: fn() },
  decorators: [
    (Story, { parameters }) => (
      // At the right end of the list toolbar, as in the page.
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: 480,
          maxWidth: '100%',
          // Room below for a menu, only where one is open: a taller box
          // centred in a small card pushes the closed field out of view.
          minHeight: parameters.menuOpen ? 340 : undefined,
        }}
      >
        <Text variant="boLabel" m="0" mt="8px">
          12 inputs
        </Text>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed. */
export const Default: Story = {};

export const Open: Story = {
  parameters: { menuOpen: true },
  play: openMenu,
};

/** Filters on: a dot on the button, counts and "Clear all filters". */
export const OpenWithActiveFilters: Story = {
  parameters: { menuOpen: true },
  args: { categories: mockFilterCategories(true) },
  play: openMenu,
};

/** The status filter opened. */
export const StatusOptions: Story = {
  parameters: { menuOpen: true },
  args: { categories: mockFilterCategories(true) },
  play: async (context) => {
    await openMenu(context);
    await userEvent.click(
      within(context.canvasElement).getByRole('button', { name: /Status/ })
    );
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: openMenu,
};
