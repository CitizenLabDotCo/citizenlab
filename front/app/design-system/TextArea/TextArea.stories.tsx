import React from 'react';

import TextArea from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Text area',
  component: TextArea,
  args: {
    label: 'Summary',
    placeholder: 'Add a short summary',
    description: 'Shown under the title.',
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const value =
  'Families asked for more shade and benches along the Mere, and a safe crossing at Station Road.';

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
      {(['placeholder', 'filled'] as const).map((content) => (
        <div
          key={content}
          style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}
        >
          {states.map((state) => (
            <div key={state.name} style={{ width: 200 }}>
              <TextArea
                label="Summary"
                placeholder="Add a short summary"
                description="Shown under the title."
                errorMessage={
                  content === 'filled'
                    ? 'Use 300 characters or fewer.'
                    : 'Add a summary to publish.'
                }
                defaultValue={content === 'filled' ? value : undefined}
                isInvalid={'isInvalid' in state}
                isDisabled={'isDisabled' in state}
                isReadOnly={'isReadOnly' in state}
              />
            </div>
          ))}
          <div style={{ width: 200 }}>
            <TextArea
              label="Summary"
              placeholder="Add a short summary"
              description="Shown under the title."
              isRequired
            />
          </div>
        </div>
      ))}
    </div>
  ),
};
