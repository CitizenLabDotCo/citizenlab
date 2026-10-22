import React from 'react';

import Input from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Forms/Input',
  tags: ['shared'],
  parameters: { gv: {} },
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

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focus: true, focusVisible: true } },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const Error: Story = {
  args: {
    ...Default.args,
    label: 'Email address',
    value: 'email@',
    error: 'Enter a valid email address.',
    ariaInvalid: true,
  },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    value:
      'Replace the parking spaces along the main street with a wide cycle lane, benches and trees for the whole neighbourhood',
  },
};

export const RTL: Story = {
  args: { ...Default.args, label: 'عنوان الفكرة', value: 'نص تجريبي' },
  render: (props) => (
    <div dir="rtl" style={{ width: '300px' }}>
      <Input {...props} />
    </div>
  ),
};
