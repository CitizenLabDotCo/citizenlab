import React from 'react';

import Box from '../../components/Box';
import Icon from '../../components/Icon';

import InputContainer from './InputContainer';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Forms/InputContainer',
  tags: ['shared'],
  parameters: { gv: {} },
  component: InputContainer,
  render: (args) => (
    <div style={{ width: '300px' }}>
      <InputContainer {...args} />
    </div>
  ),
} satisfies Meta<typeof InputContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (label: string) => (
  <Box display="flex" justifyContent="space-between" width="100%">
    <span>{label}</span>
    <Icon name="chevron-down" />
  </Box>
);

export const Default: Story = {
  args: {
    children: content('Select a district'),
    onClick: () => {},
  },
};

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['button'] } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focus: ['button'], focusVisible: ['button'] } },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    children: content(
      'Northern district, including the harbour area and the old town'
    ),
  },
};
