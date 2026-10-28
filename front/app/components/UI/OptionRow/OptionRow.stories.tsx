import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import OptionRow from '.';

// A full-width choice row: a 20px icon, a title with an optional grey
// description, a grey hover and a teal check when selected. The Publish
// dropdown's visibility options and the option picker list are made of it.

const meta = {
  title: 'Components/Redesigned/Shared pieces/Option row',
  tags: ['bo', 'redesigned'],
  component: OptionRow,
  args: {
    icon: 'eye',
    label: 'Public',
    description: 'Anyone can find this project on the platform',
    selected: true,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <Box w="360px" p="12px" background="white" role="radiogroup">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof OptionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Selected, with a description. */
export const Default: Story = {};

export const NotSelected: Story = {
  args: { selected: false },
};

/** Only a title, as in the option picker. */
export const NoDescription: Story = {
  args: { icon: 'folder-outline', label: 'Parks and green spaces' },
};

export const Hover: Story = {
  args: { selected: false },
  parameters: { pseudo: { hover: ['button'] } },
};

/** The two visibility rows of the Publish dropdown. */
export const List: Story = {
  render: (args) => (
    <>
      <OptionRow {...args} />
      <OptionRow
        {...args}
        icon="eye-off"
        label="Private"
        description="Only people with the link can find it"
        selected={false}
      />
    </>
  ),
};

export const LongContent: Story = {
  args: {
    label:
      'Only the members of the groups you select, plus the admins and managers',
    description:
      'Residents who are not in one of these groups see a message that the project is not open to them yet.',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
