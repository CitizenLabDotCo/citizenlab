import React, { ComponentProps, useState } from 'react';

import Button from '../Button';

import Modal from '.';

import type { Meta, StoryObj } from '@storybook/react';

// Stand-in for the _Slot body Figma draws.
const Slot = ({ fill }: { fill?: boolean }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: fill ? 1 : undefined,
      height: fill ? undefined : 64,
      borderRadius: 8,
      background: 'var(--gv-surface-panel-subtle)',
      border: '1px solid var(--gv-border-control)',
      font: '12px/16px var(--gv-font-family)',
      color: 'var(--gv-text-tertiary)',
    }}
  >
    Content: swap this slot
  </div>
);

const meta = {
  title: 'Design system/Overlays/Modal',
  component: Modal,
  args: {
    title: 'Modal title',
    isOpen: true,
    onOpenChange: () => {},
    children: <Slot />,
    primaryAction: { label: 'Save', onPress: (close) => close() },
    secondaryAction: { label: 'Cancel' },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

type ModalProps = ComponentProps<typeof Modal>;

const sizeStory = (size: NonNullable<ModalProps['size']>): Story => ({
  args: {
    size,
    children: <Slot fill={size === 866 || size === 920} />,
  },
});

export const Size440 = sizeStory(440);
export const Size560 = sizeStory(560);
export const Size866 = sizeStory(866);
export const Size920 = sizeStory(920);

export const WithDescription: Story = {
  args: { description: 'One line that says what happens here.' },
};

export const PrimaryOnly: Story = {
  args: { title: 'Add files', secondaryAction: undefined },
};

export const NoFooter: Story = {
  args: { primaryAction: undefined, secondaryAction: undefined },
};

const WithTriggerExample = (args: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open modal</Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export const WithTrigger: Story = {
  render: (args) => <WithTriggerExample {...args} />,
};

// A press on the backdrop also closes it.
export const Dismissable: Story = {
  args: { isDismissable: true },
  render: (args) => <WithTriggerExample {...args} />,
};
