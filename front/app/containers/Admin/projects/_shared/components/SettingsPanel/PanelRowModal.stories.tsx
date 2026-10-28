import React from 'react';

import { Box, Input, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from 'storybook/test';

import PanelRowModal from './PanelRowModal';

// A setup panel row that opens a modal with the row's label as its title
// and the settings inside.

const openModal = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button'));
  await waitFor(
    () => {
      if (!document.querySelector('.e2e-modal-close-button')) {
        throw new Error('modal not open yet');
      }
    },
    { timeout: 10000 }
  );
};

const meta = {
  title: 'Components/Redesigned/Settings panel/Panel row modal',
  tags: ['bo', 'redesigned'],
  component: PanelRowModal,
  parameters: { layout: 'fullscreen' },
  args: {
    label: 'Phase report',
    width: '560px',
    children: (
      <Box display="flex" flexDirection="column" gap="16px">
        <Text variant="boHelper" m="0px">
          The report residents see at the end of this phase.
        </Text>
        <Input type="text" variant="bo" label="Report title" value="" />
      </Box>
    ),
  },
  decorators: [
    (Story) => (
      <Box h="640px" p="24px">
        <Box w="332px" px="16px" background="white">
          <Story />
        </Box>
      </Box>
    ),
  ],
} satisfies Meta<typeof PanelRowModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The row clicked: the modal is open. */
export const Default: Story = {
  play: openModal,
};

/** Only the row, closed. */
export const Closed: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: openModal,
};
