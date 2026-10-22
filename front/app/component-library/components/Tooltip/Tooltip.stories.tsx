import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Tooltip from './';

const meta = {
  title: 'Components/Overlays/Tooltip',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <p>Hover over me</p>,
  },
};

export const Open: Story = {
  args: {
    ...Default.args,
    visible: true,
    appendTo: 'parent',
    placement: 'bottom',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '120px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export const LongContent: Story = {
  args: {
    ...Open.args,
    content:
      "Participants can submit ideas, comment on each other's ideas and vote on the ones they want to see next, for as long as the phase stays open to the whole community.",
  },
  decorators: Open.decorators,
};

export const RTL: Story = {
  args: {
    ...Open.args,
    content: 'هذا نص توضيحي',
    children: <p>مرر المؤشر فوقي</p>,
  },
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ minHeight: '120px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};
