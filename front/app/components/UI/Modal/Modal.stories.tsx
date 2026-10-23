import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import Modal from '.';

// The modal renders into #modal-portal, which the Storybook contexts add.
// The play step waits well past the enter transition (500ms on desktop,
// 700ms on phones) so the screenshots are stable.
const meta = {
  title: 'Components/Overlays/Modal',
  tags: ['shared'],
  parameters: { gv: {}, layout: 'fullscreen' },
  component: Modal,
  args: {
    opened: true,
    close: fn(),
    header: 'Delete this project?',
    children: (
      <Box p="24px">
        <Text m="0px">
          The project and all its inputs will be removed. This cannot be
          undone.
        </Text>
      </Box>
    ),
    footer: (
      <Box display="flex" gap="8px" ml="auto">
        <Button buttonStyle="secondary-outlined">Cancel</Button>
        <Button buttonStyle="delete">Delete</Button>
      </Box>
    ),
  },
  render: (args) => (
    <Box height="900px">
      <Modal {...args} />
    </Box>
  ),
  play: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BackOffice: Story = {
  args: { variant: 'bo' },
};

export const WithoutHeader: Story = {
  args: { header: undefined, footer: undefined },
};

export const WithoutCloseButton: Story = {
  args: { hideCloseButton: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    header: 'حذف هذا المشروع؟',
    children: (
      <Box p="24px">
        <Text m="0px">سيتم حذف المشروع وكل مدخلاته. لا يمكن التراجع عن ذلك.</Text>
      </Box>
    ),
    footer: (
      <Box display="flex" gap="8px" mr="auto">
        <Button buttonStyle="secondary-outlined">إلغاء</Button>
        <Button buttonStyle="delete">حذف</Button>
      </Box>
    ),
  },
};
