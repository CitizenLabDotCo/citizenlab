import React from 'react';

import AffixField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Field with affix',
  component: AffixField,
  args: {
    label: 'Project URL',
    prefix: '/projects/',
    defaultValue: 'market-square',
    description: 'Letters, numbers and dashes.',
  },
} satisfies Meta<typeof AffixField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const states = [
  { name: 'Default' },
  { name: 'Invalid', isInvalid: true },
  { name: 'Disabled', isDisabled: true },
] as const;

// Hovered and Focused come from the pointer and keyboard.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {([36, 32] as const).map((size) => (
        <React.Fragment key={size}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {states.map((state) => (
              <div key={state.name} style={{ width: 248 }}>
                <AffixField
                  label="Project URL"
                  prefix="/projects/"
                  defaultValue={
                    'isInvalid' in state ? 'old-town' : 'market-square'
                  }
                  description="Letters, numbers and dashes."
                  errorMessage="This URL is already taken."
                  size={size}
                  isInvalid={'isInvalid' in state}
                  isDisabled={'isDisabled' in state}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {states.map((state) => (
              <div key={state.name} style={{ width: 248 }}>
                <AffixField
                  label="Reminder"
                  suffix="days"
                  defaultValue={'isInvalid' in state ? '45' : '3'}
                  description="Before the phase ends."
                  errorMessage="Use 30 days or fewer."
                  size={size}
                  isInvalid={'isInvalid' in state}
                  isDisabled={'isDisabled' in state}
                />
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  ),
};
