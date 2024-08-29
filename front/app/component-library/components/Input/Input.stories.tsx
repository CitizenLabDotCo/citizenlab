import React from 'react';

import Input from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Input',
  render: (props) => {
    return (
      <div style={{ width: '300px' }}>
        <Input {...props} />
      </div>
    );
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'text',
    disabled: false,
    onChange: () => {},
    size: 'small',
    value: 'Some random text',
  },
};

export const WithPlaceholder: Story = {
  args: {
    ...Default.args,
    value: '',
    placeholder: 'placeholder',
  },
};

export const WithLabel: Story = {
  args: {
    ...Default.args,
    label: 'A label',
  },
};

export const WithMaxChar: Story = {
  args: {
    ...Default.args,
    maxCharCount: 20,
  },
};

export const Date: Story = {
  args: {
    ...Default.args,
    type: 'date',
    value: '2019-07-17',
  },
};

export const Email: Story = {
  args: {
    ...Default.args,
    type: 'email',
    value: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    ...Default.args,
    type: 'password',
    value: 'password',
  },
};
