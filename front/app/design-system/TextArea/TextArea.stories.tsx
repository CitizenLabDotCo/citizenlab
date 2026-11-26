import React from 'react';

import TextArea from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Text area',
  component: TextArea,
  args: {
    label: 'Summary',
    placeholder: 'Add a short summary',
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const value =
  'Families asked for more shade and benches along the Mere, and a safe crossing at Station Road.';

// Hovered and Focused come from the pointer and keyboard.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['placeholder', 'filled'] as const).map((content) => (
        <div
          key={content}
          style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}
        >
          {[false, true].map((isInvalid) => (
            <div key={String(isInvalid)} style={{ width: 200 }}>
              <TextArea
                label="Summary"
                placeholder="Add a short summary"
                errorMessage={
                  content === 'filled'
                    ? 'Use 300 characters or fewer.'
                    : 'Add a summary to publish.'
                }
                value={content === 'filled' ? value : ''}
                isInvalid={isInvalid}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
