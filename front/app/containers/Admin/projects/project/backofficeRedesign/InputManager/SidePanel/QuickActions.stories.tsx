import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  inputManagerHandlers,
  managedIdea,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import QuickActions from './QuickActions';

// The three icon buttons at the top of the input side panel: edit, view
// on the platform, and delete (with a confirmation).

const meta = {
  title: 'Components/Redesigned/Input manager/Quick actions',
  tags: ['bo', 'redesigned'],
  component: QuickActions,
  parameters: { msw: inputManagerHandlers },
  args: { idea: managedIdea, onEdit: fn(), onDeleted: fn() },
  decorators: [
    // Opposite the reaction counts, as in the side panel.
    (Story) => (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="592px"
        maxWidth="100%"
      >
        <Box display="flex" alignItems="center" gap="4px">
          <Icon name="vote-up" width="16px" fill={colors.coolGrey600} />
          <Text variant="boLabel" m="0">
            {managedIdea.attributes.likes_count}
          </Text>
        </Box>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof QuickActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DeleteConfirmation: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Delete' })
    );
    await waitForText(document.body, 'Cancel');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
