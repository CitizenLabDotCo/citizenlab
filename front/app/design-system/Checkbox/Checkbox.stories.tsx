import React from 'react';

import Checkbox from '.';
import CheckboxGroup from './CheckboxGroup';

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
  { label: 'Yes', props: { defaultSelected: true } },
  { label: 'Indeterminate', props: { isIndeterminate: true } },
];

const states = [
  { label: 'Default', props: {} },
  { label: 'Disabled', props: { isDisabled: true } },
  { label: 'Invalid', props: { isInvalid: true } },
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

export const Group: Story = {
  render: () => (
    <CheckboxGroup
      label="Show these layers"
      isInvalid
      errorMessage="Pick at least one layer"
    >
      <Checkbox value="map">Show on the map</Checkbox>
      <Checkbox value="list">Show in the list</Checkbox>
    </CheckboxGroup>
  ),
};
