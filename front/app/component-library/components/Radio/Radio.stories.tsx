import Radio from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: true,
    currentValue: true,
    disabled: false,
    onChange: () => {},
    name: 'name 1',
  },
};

export const WithLabel: Story = {
  args: {
    id: 'id',
    value: true,
    currentValue: true,
    disabled: false,
    onChange: () => {},
    name: 'name 1',
    label: 'A radio with label',
  },
};
