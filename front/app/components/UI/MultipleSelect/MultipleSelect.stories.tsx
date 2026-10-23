import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, waitFor } from 'storybook/test';

import MultipleSelect from '.';

const options = [
  { value: 'mobility', label: 'Mobility' },
  { value: 'climate', label: 'Climate' },
  { value: 'housing', label: 'Housing' },
  { value: 'culture', label: 'Culture' },
  { value: 'safety', label: 'Safety' },
];

const meta = {
  title: 'Components/Forms/MultipleSelect',
  tags: ['shared'],
  parameters: { gv: {} },
  component: MultipleSelect,
  args: {
    inputId: 'topics',
    label: 'Topics',
    options,
    onChange: fn(),
    value: ['mobility', 'climate'],
  },
  render: (args) => (
    <div style={{ width: '420px', padding: '8px', minHeight: '360px' }}>
      <MultipleSelect {...args} />
    </div>
  ),
} satisfies Meta<typeof MultipleSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { value: [], placeholder: 'Select topics' },
};

// react-select draws its focus style from its own focus state, so a keyboard
// focus sets it.
export const Focus: Story = {
  play: async () => {
    await userEvent.tab();
  },
};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement.querySelector('input') as Element);
    await waitFor(() => {
      if (!document.querySelector('[id$="-listbox"]')) {
        throw new Error('menu not open');
      }
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const LongContent: Story = {
  args: { value: options.map((o) => o.value) },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    label: 'المواضيع',
    options: [
      { value: 'mobility', label: 'التنقل' },
      { value: 'climate', label: 'المناخ' },
      { value: 'housing', label: 'السكن' },
    ],
  },
};
