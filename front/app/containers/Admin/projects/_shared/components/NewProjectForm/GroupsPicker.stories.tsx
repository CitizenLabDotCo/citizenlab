import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { sharedPiecesHandlers } from '../../../../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import GroupsPicker from './GroupsPicker';

// The groups field of the New project form: the user groups as a pill
// picker, indented under the "Selected groups" choice, with an error line
// when none is chosen.

const Controlled = (args: React.ComponentProps<typeof GroupsPicker>) => {
  const [groupIds, setGroupIds] = useState(args.groupIds);
  return (
    <GroupsPicker
      {...args}
      groupIds={groupIds}
      onChange={(next) => {
        setGroupIds(next);
        args.onChange(next);
      }}
    />
  );
};

const meta = {
  title: 'Components/Redesigned/New project/Groups picker',
  tags: ['bo', 'redesigned'],
  component: GroupsPicker,
  parameters: { msw: sharedPiecesHandlers },
  args: {
    groupIds: ['bo-group-residents', 'bo-group-youth'],
    showError: false,
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  decorators: [
    (Story) => (
      <Box w="480px" h="400px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Residents of the north');
  },
} satisfies Meta<typeof GroupsPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two groups chosen. */
export const Default: Story = {};

/** None chosen yet and Create pressed: the error shows. */
export const Error: Story = {
  args: { groupIds: [], showError: true },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Choose at least one group');
  },
};

/** The popover open. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Residents of the north');
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Choose groups/ })
    );
    await waitForText(canvasElement, 'School teachers');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => undefined,
};
