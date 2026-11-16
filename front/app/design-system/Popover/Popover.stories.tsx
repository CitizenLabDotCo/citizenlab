import React from 'react';

import Button from '../Button';
import TextField from '../TextField';

import Popover, { DialogTrigger } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Overlays/Popover',
  component: Popover,
  args: { title: 'Rename', children: null },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stand-in for the _Slot body Figma draws.
const Slot = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 64,
      borderRadius: 8,
      background: 'var(--gv-surface-secondary)',
      border: '1px solid var(--gv-border-control)',
      font: '12px/16px var(--gv-font-family)',
      color: 'var(--gv-text-tertiary)',
    }}
  >
    Content: swap this slot
  </div>
);

const Trigger = ({ children }: { children: React.ReactElement }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', width: 400 }}>
    <DialogTrigger defaultOpen>
      <Button hasMenu>Open</Button>
      {children}
    </DialogTrigger>
  </div>
);

export const Default: Story = {
  render: () => (
    <Trigger>
      <Popover title="Rename">
        <Slot />
      </Popover>
    </Trigger>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <Trigger>
      <Popover aria-label="Rename">
        <Slot />
      </Popover>
    </Trigger>
  ),
};

// The _Popover body · Rename example.
export const Rename: Story = {
  render: () => (
    <Trigger>
      <Popover title="Rename">
        <TextField
          label="Project title"
          size={32}
          defaultValue="Westmere Riverside Park"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button size={28} slot="close">
            Cancel
          </Button>
          <Button size={28} variant="primary" slot="close">
            Save
          </Button>
        </div>
      </Popover>
    </Trigger>
  ),
};
