import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Label from '.';

const meta = {
  title: 'Components/Forms/Label',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'This is a label that uses the value prop',
  },
};

export const LongContent: Story = {
  args: {
    value:
      'Describe the idea you would like to share with the community, including where it would apply and who it would help',
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <Label {...args} />
    </div>
  ),
};

export const RTL: Story = {
  args: { value: 'عنوان الفكرة' },
  render: (args) => (
    <div dir="rtl">
      <Label {...args} />
    </div>
  ),
};
