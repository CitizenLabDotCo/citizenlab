import React, { ComponentProps, useState } from 'react';

import Button from '../Button';

import SidePanel from '.';

import type { Meta, StoryObj } from '@storybook/react';

// Stand-in for the _Slot body Figma draws.
const Slot = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 64,
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
  title: 'Design system/Overlays/Side panel',
  component: SidePanel,
  args: {
    title: 'Folder settings',
    children: (
      <>
        <Slot />
        <Slot />
      </>
    ),
    isOpen: true,
    onOpenChange: () => {},
  },
} satisfies Meta<typeof SidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const WithTriggerExample = (args: ComponentProps<typeof SidePanel>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Folder settings</Button>
      <SidePanel {...args} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export const WithTrigger: Story = {
  render: (args) => <WithTriggerExample {...args} />,
};
