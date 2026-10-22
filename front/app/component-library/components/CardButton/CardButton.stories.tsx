import React from 'react';

import { userEvent, within } from 'storybook/test';

import CardButton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Actions/CardButton',
  tags: ['bo'],
  parameters: { gv: {} },
  component: CardButton,
} satisfies Meta<typeof CardButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    iconName: 'close',
    title: 'Close',
    subtitle: 'close',
    mr: '8px',
    selected: false,
  },
};

export const Selected: Story = {
  args: { ...Default.args, selected: true },
};

// The hover background is set from mouse events in state, which the
// pseudo-states addon cannot reach, so hover with the pointer.
export const Hover: Story = {
  args: Default.args,
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focusVisible: ['button'] } },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const LongContent: Story = {
  args: {
    iconName: 'close',
    title: 'Looong title with many words and such',
    subtitle: 'close',
    mr: '8px',
    selected: true,
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    ...Default.args,
    title: 'إغلاق',
    subtitle: 'إغلاق المرحلة',
    titleLabel: <span>جديد</span>,
  },
};
