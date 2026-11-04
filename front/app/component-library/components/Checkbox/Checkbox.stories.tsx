import { userEvent } from 'storybook/test';

import Checkbox from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Forms/Checkbox',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
    onChange: () => {},
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    onChange: () => {},
  },
};

export const Indeterminate: Story = {
  args: {
    checked: false,
    indeterminate: true,
    onChange: () => {},
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
