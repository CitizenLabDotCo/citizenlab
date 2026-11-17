import React from 'react';

import AffixField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Field with affix',
  component: AffixField,
  args: {
    label: 'Project URL',
    prefix: '/projects/',
    value: 'market-square',
    description: 'Letters, numbers and dashes.',
  },
} satisfies Meta<typeof AffixField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Hovered and Focused come from the pointer and keyboard.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {[false, true].map((isInvalid) => (
        <div key={String(isInvalid)} style={{ width: 248 }}>
          <AffixField
            label="Project URL"
            prefix="/projects/"
            value={isInvalid ? 'old-town' : 'market-square'}
            description="Letters, numbers and dashes."
            errorMessage="This URL is already taken."
            isInvalid={isInvalid}
          />
        </div>
      ))}
    </div>
  ),
};
