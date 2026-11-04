import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
// eslint-plugin-storybook 0.8 knows expect from @storybook/test, not from
// storybook/test (Storybook 10), so it flags every expect here.
/* eslint-disable storybook/use-storybook-expect */

import Select from './';

const meta = {
  title: 'Components/Forms/Select',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      {
        value: 'option-1',
        label: 'Option 1',
      },
      {
        value: 'option-1',
        label: 'Option 2',
      },
    ],
    onChange: () => {},
  },
};

export const WithSelectedOption: Story = {
  args: {
    ...Default.args,
    value: {
      value: 'option-1',
      label: 'Option 1',
    },
  },
};

export const WithLabel: Story = {
  args: {
    ...WithSelectedOption.args,
    label: 'This is a label',
  },
};

export const Disabled: Story = {
  args: {
    ...WithSelectedOption.args,
    disabled: true,
  },
};

export const WithNumberValues: Story = {
  args: {
    options: [
      {
        value: 1,
        label: 'Option 1',
      },
      {
        value: 2,
        label: 'Option 2',
      },
    ],
    value: {
      value: 3,
      label: 'Option 1',
    },
    onChange: () => {},
  },
};

export const WithPlaceholder: Story = {
  args: {
    ...Default.args,
    placeholder: 'Placeholder',
  },
};

export const Hover: Story = {
  args: WithSelectedOption.args,
  parameters: { pseudo: { hover: ['select'] } },
};

export const Focus: Story = {
  args: WithSelectedOption.args,
  parameters: { pseudo: { focus: ['select'], focusVisible: ['select'] } },
};

export const LongContent: Story = {
  args: {
    options: [
      {
        value: 'long',
        label:
          'Replace the parking spaces along the main street with a wide cycle lane and benches',
      },
    ],
    value: {
      value: 'long',
      label:
        'Replace the parking spaces along the main street with a wide cycle lane and benches',
    },
    onChange: () => {},
  },
  render: (args) => (
    <div style={{ width: '240px' }}>
      <Select {...args} />
    </div>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    options: [{ value: 'a', label: 'الخيار الأول' }],
    value: { value: 'a', label: 'الخيار الأول' },
    label: 'اختر خيارا',
    onChange: () => {},
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <Select {...args} />
    </div>
  ),
};

// Tab reaches the select. Its options open and change with the browser's
// own keys (a native select), which a play step cannot press.
export const Keyboard: Story = {
  args: WithLabel.args,
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox');
    await userEvent.tab();
    await expect(select).toHaveFocus();
  },
};
