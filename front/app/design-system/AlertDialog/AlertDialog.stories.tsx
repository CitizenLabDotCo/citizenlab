import React from 'react';

import { DialogTrigger } from 'react-aria-components';

import Button from '../Button';

import AlertDialog from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Overlays/Alert dialog',
  component: AlertDialog,
  args: {
    title: 'Delete project',
    children:
      'Westmere Riverside Park, its phases and its 312 inputs will be deleted. This cannot be undone.',
    confirmLabel: 'Delete project',
    onConfirm: (close) => close(),
    defaultOpen: true,
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { isPending: true },
};

export const WithTrigger: Story = {
  args: { defaultOpen: undefined },
  render: (args) => (
    <DialogTrigger>
      <Button variant="danger">Delete project</Button>
      <AlertDialog {...args} />
    </DialogTrigger>
  ),
};
