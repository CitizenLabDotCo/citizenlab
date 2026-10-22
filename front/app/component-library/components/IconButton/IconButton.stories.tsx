import React from 'react';

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
