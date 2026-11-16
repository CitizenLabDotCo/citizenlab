import React from 'react';

import RadioGroup, { Radio } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Radio group',
  component: RadioGroup,
  args: { label: 'Who can take part', children: null },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup label="Who can take part" defaultValue="everyone">
      <Radio value="everyone">Everyone</Radio>
      <Radio value="registered">Registered residents</Radio>
      <Radio value="groups">Selected groups</Radio>
    </RadioGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      <RadioGroup label="Default" defaultValue="yes">
        <Radio value="yes">Everyone</Radio>
        <Radio value="no">Everyone</Radio>
      </RadioGroup>
      <RadioGroup label="Disabled" defaultValue="yes" isDisabled>
        <Radio value="yes">Everyone</Radio>
        <Radio value="no">Everyone</Radio>
      </RadioGroup>
    </div>
  ),
};

// Budgeting looks disabled but stays focusable: Tab and the arrow keys reach it and
// the tooltip says why; clicking it, Space or arrowing onto it keeps the choice.
export const DisabledWithReason: Story = {
  render: () => (
    <RadioGroup label="Voting method" defaultValue="single">
      <Radio value="single">Single vote</Radio>
      <Radio value="budgeting" disabledReason="Budgeting needs the add-on">
        Budgeting
      </Radio>
      <Radio value="multiple">Multiple votes</Radio>
    </RadioGroup>
  ),
};

// No visible label: a heading above already names the choice.
export const AriaLabelOnly: Story = {
  render: () => (
    <RadioGroup aria-label="Voting method" defaultValue="single">
      <Radio value="single">Single vote</Radio>
      <Radio value="multiple">Multiple votes</Radio>
    </RadioGroup>
  ),
};
