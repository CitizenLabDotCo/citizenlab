import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../.storybook/mocks/backofficeRedesign';

import IconAction from '.';

// A 28px transparent icon button with a grey icon that turns near-black on
// hover and a dark tooltip: the small actions on the event image row and
// on back-office file rows.

const meta = {
  title: 'Components/Redesigned/Library variants/Icon action',
  tags: ['bo', 'redesigned'],
  component: IconAction,
  args: {
    icon: 'close',
    tooltip: 'Remove file',
    ariaLabel: 'Remove file',
    onClick: fn(),
  },
  decorators: [
    (Story, { name }) => (
      <Box p="40px" display="flex" gap="8px" background="white">
        <Text variant="boMicro" m="0px" mb="8px">
          {name}
        </Text>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof IconAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The set used on the event image row. */
export const Row: Story = {
  render: (args) => (
    <>
      <IconAction {...args} icon="edit" tooltip="Edit" ariaLabel="Edit" />
      <IconAction {...args} icon="image" tooltip="Crop" ariaLabel="Crop" />
      <IconAction {...args} icon="delete" tooltip="Delete" ariaLabel="Delete" />
    </>
  ),
};

/** Hovered: darker icon and the tooltip. */
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
    await waitForText(document.body, 'Remove file');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
