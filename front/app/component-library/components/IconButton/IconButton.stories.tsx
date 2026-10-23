import React from 'react';

import { expect, fn, userEvent, within } from 'storybook/test';
// eslint-plugin-storybook 0.8 knows expect from @storybook/test, not from
// storybook/test (Storybook 10), so it flags every expect here.
/* eslint-disable storybook/use-storybook-expect */

import IconButton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Actions/IconButton',
  component: IconButton,
  tags: ['shared'],
  parameters: { gv: {} },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    iconName: 'close',
    a11y_buttonActionMessage: 'Close the panel',
    onClick: () => {},
  },
};

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['button'] } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focusVisible: ['button'] } },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    ...Default.args,
    iconName: 'arrow-left',
    a11y_buttonActionMessage: 'رجوع',
  },
  render: (args) => (
    <div>
      <IconButton {...args} />
    </div>
  ),
};

// Tab reaches the button by its name; Enter and Space activate it.
export const Keyboard: Story = {
  args: { ...Default.args, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Close the panel',
    });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
