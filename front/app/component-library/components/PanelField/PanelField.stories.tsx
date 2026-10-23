import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Input from '../Input';

import PanelField from '.';

const meta = {
  title: 'Components/Forms/PanelField',
  tags: ['bo'],
  parameters: { gv: {} },
  component: PanelField,
  args: {
    label: 'Phase title',
    children: (
      <Input type="text" value="Share your ideas" onChange={() => {}} />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'calc(var(--gv-space-24) * 4)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Fields one under the other: each keeps its own space below. */
export const Stacked: Story = {
  render: (args) => (
    <>
      <PanelField {...args} />
      <PanelField label="Description">
        <Input type="text" value="Tell us what you think" onChange={() => {}} />
      </PanelField>
    </>
  ),
};

export const LongContent: Story = {
  args: {
    label:
      'How many ideas can a participant submit during this phase of the project',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    label: 'عنوان المرحلة',
    children: <Input type="text" value="شارك أفكارك" onChange={() => {}} />,
  },
};
