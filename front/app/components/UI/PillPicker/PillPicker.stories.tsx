import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../.storybook/mocks/backofficeRedesign';

import PillPicker from '.';

// Round tinted pills for the chosen items, each with an x, and a dashed
// "Add" pill that opens a white popover with a search and a checkbox list.
// The New project form picks its groups with it.

const GROUPS = [
  { value: 'residents', label: 'Residents of the north' },
  { value: 'youth', label: 'Youth council members' },
  { value: 'staff', label: 'City staff' },
  { value: 'shops', label: 'Shop owners' },
  { value: 'schools', label: 'School teachers' },
  { value: 'seniors', label: 'Seniors club' },
];

const Controlled = (args: React.ComponentProps<typeof PillPicker>) => {
  const [selected, setSelected] = useState(args.selected);
  return (
    <PillPicker
      {...args}
      selected={selected}
      onChange={(next) => {
        setSelected(next);
        args.onChange(next);
      }}
    />
  );
};

const openPopover = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: /Choose groups/ })
  );
  await waitForText(canvasElement, 'Seniors club');
};

const meta = {
  title: 'Components/Redesigned/Shared pieces/Pill picker',
  tags: ['bo', 'redesigned'],
  component: PillPicker,
  args: {
    options: GROUPS,
    selected: ['residents', 'youth'],
    onChange: fn(),
    addLabel: 'Choose groups',
    searchPlaceholder: 'Search groups',
    noMatchLabel: 'No groups match',
  },
  render: (args) => <Controlled {...args} />,
  decorators: [
    (Story) => (
      <Box w="480px" h="420px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PillPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two groups chosen and the Add pill. */
export const Default: Story = {};

/** Nothing chosen yet: only the dashed Add pill. */
export const Empty: Story = {
  args: { selected: [] },
};

/** The popover open: search and checkbox list. */
export const Open: Story = {
  play: openPopover,
};

/** A search that matches nothing. */
export const NoMatch: Story = {
  play: async (context) => {
    await openPopover(context);
    await userEvent.type(
      within(context.canvasElement).getByPlaceholderText('Search groups'),
      'zzz'
    );
    await waitForText(context.canvasElement, 'No groups match');
  },
};

/** Many groups chosen: the pills wrap. */
export const LongContent: Story = {
  args: { selected: GROUPS.map(({ value }) => value) },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
