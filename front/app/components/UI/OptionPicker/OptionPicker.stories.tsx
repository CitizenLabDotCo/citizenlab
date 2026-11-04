import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../.storybook/mocks/backofficeRedesign';

import OptionPicker, { PickerOption } from '.';

// A round grey picker pill that opens an 8px-radius popover: a title and
// description, an optional search, and a list of option rows. The setup
// panel's area filter and the New project folder and space pickers use it.

const FOLDERS: PickerOption<string>[] = [
  { value: '/', label: 'No folder', icon: 'folder-outline' },
  { value: 'parks', label: 'Parks and green spaces', icon: 'folder-outline' },
  { value: 'mobility', label: 'Mobility plan 2030', icon: 'folder-outline' },
  { value: 'youth', label: 'Youth council', icon: 'folder-outline' },
  { value: 'housing', label: 'Housing and building', icon: 'folder-outline' },
];

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button'));
  await waitForText(canvasElement, 'Youth council');
};

const Controlled = (args: React.ComponentProps<typeof OptionPicker>) => {
  const [value, setValue] = useState(args.value);
  return (
    <OptionPicker
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange(next);
      }}
    />
  );
};

const meta = {
  title: 'Components/Redesigned/Shared pieces/Option picker',
  tags: ['bo', 'redesigned'],
  component: OptionPicker,
  args: {
    title: 'Folder',
    description: 'The folder this project is listed in.',
    searchPlaceholder: 'Search folders',
    options: FOLDERS,
    value: 'parks',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  decorators: [
    (Story) => (
      <Box w="420px" h="440px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof OptionPicker<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the pill shows the selected folder. */
export const Default: Story = {};

/** Open, with the search and the list. */
export const Open: Story = {
  play: open,
};

/** Open, with a search typed in that matches nothing. */
export const NoResults: Story = {
  play: async (context) => {
    await open(context);
    await userEvent.type(
      within(context.canvasElement).getByPlaceholderText('Search folders'),
      'zzz'
    );
  },
};

/** Without a search field. */
export const OpenWithoutSearch: Story = {
  args: { searchPlaceholder: undefined },
  play: open,
};

/** A fixed trigger label and icon, as the area filter shows it. */
export const TriggerLabel: Story = {
  args: {
    title: 'Areas',
    description: 'Show the inputs of one area.',
    triggerLabel: 'All areas',
    triggerIcon: 'filter',
    searchPlaceholder: undefined,
    value: undefined,
  },
};

export const LongContent: Story = {
  args: {
    value: 'long',
    options: [
      ...FOLDERS,
      {
        value: 'long',
        label:
          'Neighbourhood plans for the north district, the canal and the ring road',
        icon: 'folder-outline',
      },
    ],
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: open,
};
