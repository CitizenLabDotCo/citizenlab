import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent } from 'storybook/test';

import SearchInput from './';

const meta = {
  title: 'Components/Forms/SearchInput',
  tags: ['shared'],
  parameters: { gv: {} },
  component: SearchInput,
  render: (args) => (
    <div style={{ width: '320px' }}>
      <SearchInput {...args} />
    </div>
  ),
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'search-input',
    a11y_closeIconTitle: 'Close search',
    debounce: 500,
    placeholder: 'placeholder',
    ariaLabel: 'aria label',
    onChange: () => {},
    size: 'medium',
  },
};

export const WithDefaultValue: Story = {
  args: {
    ...Default.args,
    defaultValue: 'Default search value',
  },
};

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['input'] } },
};

// Focus also floats the label, which the component does in state, so focus
// the input with the keyboard rather than through the pseudo-states addon.
export const Focus: Story = {
  args: Default.args,
  play: async () => {
    await userEvent.tab();
  },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    defaultValue:
      'cycle lanes and safer crossings near the primary schools in the north',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { ...Default.args, placeholder: 'ابحث', defaultValue: 'دراجات' },
};
