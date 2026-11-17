import React from 'react';

import Checkbox from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Checkbox',
  component: Checkbox,
  args: { children: 'Show on the map' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const checked = [
  { label: 'No', props: {} },
  { label: 'Yes', props: { isSelected: true } },
  { label: 'Indeterminate', props: { isIndeterminate: true } },
];

const states = [
  { label: 'Default', props: {} },
  { label: 'Disabled', props: { isDisabled: true } },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {checked.map((c) => (
        <div
          key={c.label}
          style={{ display: 'flex', gap: 24, alignItems: 'center' }}
        >
          {states.map((s) => (
            <Checkbox
              key={s.label}
              aria-label={`${c.label} ${s.label}`}
              {...c.props}
              {...s.props}
            />
          ))}
          {states.map((s) => (
            <Checkbox key={`${s.label}-label`} {...c.props} {...s.props}>
              Show on the map
            </Checkbox>
          ))}
        </div>
      ))}
    </div>
  ),
};
