import React, { ComponentProps, useState } from 'react';

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
    onConfirm: () => {},
    isOpen: true,
    onOpenChange: () => {},
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { isPending: true },
};

const WithTriggerExample = (args: ComponentProps<typeof AlertDialog>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="danger" onPress={() => setIsOpen(true)}>
        Delete project
      </Button>
      <AlertDialog
        {...args}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={() => setIsOpen(false)}
      />
    </>
  );
};

export const WithTrigger: Story = {
  render: (args) => <WithTriggerExample {...args} />,
};
