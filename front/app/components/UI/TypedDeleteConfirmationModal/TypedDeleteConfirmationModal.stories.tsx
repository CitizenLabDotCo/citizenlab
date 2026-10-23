import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, waitFor } from 'storybook/test';

import TypedDeleteConfirmationModal from '.';

const waitForCloseButton = async () => {
  await waitFor(
    () => {
      if (!document.querySelector('.e2e-modal-close-button')) {
        throw new Error('close button not rendered yet');
      }
    },
    { timeout: 10000 }
  );
};

// It renders in Modal, whose close button only renders once the app
// configuration (MSW) has loaded, so the play step waits for it.
const meta = {
  title: 'Components/Overlays/TypedDeleteConfirmationModal',
  tags: ['bo'],
  parameters: { gv: {}, layout: 'fullscreen' },
  component: TypedDeleteConfirmationModal,
  args: {
    opened: true,
    onClose: fn(),
    onConfirm: fn(),
    entityName: 'Mobility plan 2030',
    title: {
      id: 'storybook.typedDelete.title',
      defaultMessage: 'Delete project',
    },
    mainWarning: {
      id: 'storybook.typedDelete.warning',
      defaultMessage:
        'The project, its phases and all inputs will be removed. This cannot be undone.',
    },
    confirmationWord: {
      id: 'storybook.typedDelete.word',
      defaultMessage: 'delete',
    },
    deleteButtonText: {
      id: 'storybook.typedDelete.button',
      defaultMessage: 'Delete project',
    },
  },
  render: (args) => (
    <Box height="900px">
      <TypedDeleteConfirmationModal {...args} />
    </Box>
  ),
  play: waitForCloseButton,
} satisfies Meta<typeof TypedDeleteConfirmationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Typing the confirmation word enables the delete button.
export const ConfirmationTyped: Story = {
  play: async () => {
    await waitForCloseButton();
    const input = document.querySelector<HTMLInputElement>(
      '[data-cy="typed-confirmation-input"] input'
    );
    if (!input) throw new Error('confirmation input not found');
    await userEvent.type(input, 'delete');
    input.blur();
  },
};

export const Loading: Story = {
  args: { isDeleting: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
