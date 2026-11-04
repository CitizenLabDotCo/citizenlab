import React from 'react';

import { userEvent } from 'storybook/test';

import Radio from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Forms/Radio',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Radio,
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

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['.circle'] } },
};

export const Focus: Story = {
  args: Default.args,
  // The ring is keyed on a focus-visible class on the hidden input, which
  // the pseudo-states addon does not set, so focus it with the keyboard.
  play: async () => {
    await userEvent.tab();
  },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const LongContent: Story = {
  args: {
    ...WithLabel.args,
    label:
      'Yes, I would like to receive updates about this project, including new phases, results and the decisions the city council takes based on them',
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <Radio {...args} />
    </div>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { ...WithLabel.args, label: 'نعم، أوافق' },
};
