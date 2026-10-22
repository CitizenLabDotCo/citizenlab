import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { colors } from 'component-library/utils/styleUtils';

import StatusLabel from './';

const meta = {
  title: 'Components/Data display/StatusLabel',
  tags: ['bo'],
  parameters: { gv: {} },
  component: StatusLabel,
} satisfies Meta<typeof StatusLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'In consideration',
    backgroundColor: colors.blue700,
  },
};

export const WithIconProp: Story = {
  args: {
    ...Default.args,
    icon: 'lock',
  },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    text: 'Accepted and planned for implementation next year',
  },
  render: (args) => (
    <div style={{ width: '240px' }}>
      <StatusLabel {...args} />
    </div>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { ...Default.args, icon: 'lock', text: 'قيد الدراسة' },
};
