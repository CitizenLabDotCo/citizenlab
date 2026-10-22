import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent } from 'storybook/test';

import { colors } from '../../utils/styleUtils';

import Toggle from './';

const meta = {
  title: 'Components/Forms/Toggle',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Toggle,
} satisfies Meta<typeof Toggle>;

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

export const WithLabel: Story = {
  args: {
    checked: false,
    label: 'A toggle with label',
    onChange: () => {},
  },
};

export const WithDescription: Story = {
  args: {
    checked: false,
    label: 'A toggle with label',
    description: 'And a description of what it does.',
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
    onChange: () => {},
  },
};

export const WithLabelTextColor: Story = {
  args: {
    checked: false,
    disabled: false,
    label: 'A toggle with colored label',
    labelTextColor: colors.textSecondary,
    onChange: () => {},
  },
};

export const Hover: Story = {
  args: WithLabel.args,
  parameters: { pseudo: { hover: ['i'] } },
};

export const Focus: Story = {
  args: WithLabel.args,
  // The ring is keyed on a focus-visible class on the hidden checkbox, which
  // the pseudo-states addon does not set, so focus it with the keyboard.
  play: async () => {
    await userEvent.tab();
  },
};

export const LongContent: Story = {
  args: {
    checked: true,
    label:
      "Allow participants to submit ideas, comment on each other's ideas and vote while the phase is open",
    description:
      'When this is switched off, the phase stays visible on the timeline but nobody can add or change anything until you switch it back on.',
    onChange: () => {},
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <Toggle {...args} />
    </div>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    checked: true,
    label: 'السماح بإرسال الأفكار',
    description: 'يمكن للمشاركين إضافة أفكار جديدة.',
    onChange: () => {},
  },
  render: (args) => (
    <div>
      <Toggle {...args} />
    </div>
  ),
};
