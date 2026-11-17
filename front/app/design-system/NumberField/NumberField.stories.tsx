import React from 'react';

import NumberField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Number field',
  component: NumberField,
  args: {
    label: 'Votes per resident',
    description: 'From 1 to 10.',
    defaultValue: 3,
    minValue: 1,
    maxValue: 10,
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Hovered and Focused come from the pointer and keyboard.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {([36, 32] as const).map((size) => (
        <div
          key={size}
          style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}
        >
          <div style={{ width: 200 }}>
            <NumberField
              label="Votes per resident"
              description="From 1 to 10."
              defaultValue={3}
              size={size}
            />
          </div>
          <div style={{ width: 200 }}>
            <NumberField
              label="Votes per resident"
              description="From 1 to 10."
              errorMessage="Use a number from 1 to 10."
              defaultValue={12}
              size={size}
              isInvalid
            />
          </div>
          <div style={{ width: 200 }}>
            <NumberField
              label="Votes per resident"
              description="From 1 to 10."
              defaultValue={3}
              size={size}
              isDisabled
            />
          </div>
          <div style={{ width: 200 }}>
            <NumberField
              label="Votes per resident"
              description="At the minimum the decrement step is disabled."
              defaultValue={1}
              minValue={1}
              maxValue={10}
              size={size}
              isRequired
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

// incrementAriaLabel / decrementAriaLabel replace React Aria's "Increase/Decrease <label>" names.
export const StepLabels: Story = {
  render: () => (
    <div style={{ width: 200 }}>
      <NumberField
        aria-label="Parking permits for residents"
        size={32}
        defaultValue={0}
        minValue={0}
        step={1}
        incrementAriaLabel="Add one"
        decrementAriaLabel="Remove one"
      />
    </div>
  ),
};
