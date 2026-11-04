import React from 'react';

import { userEvent } from 'storybook/test';

import CheckboxWithLabel from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Forms/CheckboxWithLabel',
  tags: ['shared'],
  parameters: { gv: {} },
  component: CheckboxWithLabel,
  render: (args) => (
    <div style={{ width: '480px' }}>
      <CheckboxWithLabel {...args} />
    </div>
  ),
} satisfies Meta<typeof CheckboxWithLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
    label: 'Send me a notification when this project changes phase',
    onChange: () => {},
  },
};

export const Checked: Story = {
  args: { ...Default.args, checked: true },
};

export const WithTooltip: Story = {
  args: {
    ...Default.args,
    labelTooltipText: 'You can change this later in your settings.',
  },
};

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['.e2e-checkbox'] } },
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
    ...Default.args,
    label:
      'I agree that my name and my contributions are shown publicly on this platform, next to the ideas, comments and votes I add in any project',
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <CheckboxWithLabel {...args} />
    </div>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { ...Default.args, label: 'أرسل لي إشعارا عند تغيير المرحلة' },
};
