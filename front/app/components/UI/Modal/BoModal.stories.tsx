import React from 'react';

import {
  Box,
  Button,
  Input,
  Text,
  bo,
} from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, waitFor } from 'storybook/test';

import Modal from '.';

// The back-office modal: a tighter header (16px 24px 12px) with a 14px/500
// title and a 28px close button, a bo-primary 32px footer button. Used for
// New project, the settings sub-modals and confirmations in the redesign.

const waitForClose = () =>
  waitFor(
    () => {
      if (!document.querySelector('.e2e-modal-close-button')) {
        throw new Error('close button not rendered yet');
      }
    },
    { timeout: 10000 }
  );

const headerButton = {
  height: bo.buttonMedium.height,
  padding: bo.buttonMedium.padding,
  fontSize: bo.buttonMedium.fontSize,
};

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office modal',
  tags: ['bo', 'redesigned'],
  parameters: { layout: 'fullscreen' },
  component: Modal,
  args: {
    opened: true,
    variant: 'bo',
    width: 560,
    close: fn(),
    header: 'Change the project status?',
    children: (
      <Box p="24px">
        <Text variant="boHelper" m="0px">
          The project goes back to draft. Residents can no longer see it until
          you publish it again.
        </Text>
      </Box>
    ),
    footer: (
      <Box w="100%" display="flex" justifyContent="flex-end" gap="8px">
        <Button buttonStyle="bo-secondary" {...headerButton}>
          Cancel
        </Button>
        <Button buttonStyle="bo-primary" {...headerButton}>
          Change status
        </Button>
      </Box>
    ),
  },
  render: (args) => (
    <Box height="700px">
      <Modal {...args} />
    </Box>
  ),
  play: waitForClose,
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, with a message and a two-button footer. */
export const Default: Story = {};

/** A form inside, as in the settings sub-modals. */
export const WithForm: Story = {
  args: {
    header: 'Listing',
    children: (
      <Box p="24px" display="flex" flexDirection="column" gap="16px">
        <Input type="text" variant="bo" label="Slug" value="tree-planting" />
        <Input
          type="text"
          variant="bo"
          label="Short description"
          placeholder="One line shown on the project card"
        />
      </Box>
    ),
  },
};

/** A destructive confirm. */
export const Delete: Story = {
  args: {
    header: 'Delete this event?',
    footer: (
      <Box w="100%" display="flex" justifyContent="flex-end" gap="8px">
        <Button buttonStyle="bo-secondary" {...headerButton}>
          Cancel
        </Button>
        <Button buttonStyle="bo-delete" {...headerButton}>
          Delete
        </Button>
      </Box>
    ),
  },
};

/** A long title wraps beside the close button. */
export const LongTitle: Story = {
  args: {
    header:
      'Copy the ideas of the previous phase into this phase, so residents can keep voting on them',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
