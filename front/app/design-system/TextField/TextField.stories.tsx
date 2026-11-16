import React from 'react';

import TextField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Text field',
  component: TextField,
  args: {
    label: 'Project name',
    placeholder: 'Add a name',
    description: 'Shown on the project card.',
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const states = [
  { name: 'Default' },
  { name: 'Invalid', isInvalid: true },
  { name: 'Disabled', isDisabled: true },
  { name: 'Read-only', isReadOnly: true },
] as const;

// Hovered and Focused come from the pointer and keyboard.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {([36, 32] as const).map((size) =>
        (['placeholder', 'filled'] as const).map((content) => (
          <div
            key={`${size}-${content}`}
            style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}
          >
            {states.map((state) => (
              <div key={state.name} style={{ width: 200 }}>
                <TextField
                  label="Project name"
                  placeholder="Add a name"
                  description="Shown on the project card."
                  errorMessage={
                    content === 'filled'
                      ? 'Use 80 characters or fewer.'
                      : 'Add a name to publish.'
                  }
                  defaultValue={
                    content === 'filled' ? 'Westmere Park renewal' : undefined
                  }
                  size={size}
                  isInvalid={'isInvalid' in state}
                  isDisabled={'isDisabled' in state}
                  isReadOnly={'isReadOnly' in state}
                />
              </div>
            ))}
            <div style={{ width: 200 }}>
              <TextField
                label="Project name"
                placeholder="Add a name"
                description="Shown on the project card."
                size={size}
                isRequired
              />
            </div>
          </div>
        ))
      )}
    </div>
  ),
};
