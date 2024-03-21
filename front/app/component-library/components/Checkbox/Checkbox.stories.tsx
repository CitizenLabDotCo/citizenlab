import Checkbox from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
    onChange: () => {},
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    onChange: () => {},
  },
};

export const Indeterminate: Story = {
  args: {
    checked: false,
    indeterminate: true,
    onChange: () => {},
  },
};
