import React from 'react';

import { Time } from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';

import TimeField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Time field',
  component: TimeField,
  args: { label: 'Start time', description: 'In Westmere time.' },
  decorators: [
    (Story) => (
      <I18nProvider locale="en-GB">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const states = [
  { name: 'Default' },
  { name: 'Invalid', isInvalid: true, errorMessage: 'Add a start time.' },
  { name: 'Disabled', isDisabled: true },
  { name: 'Read-only', isReadOnly: true },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      {([36, 32] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 24 }}>
          {states.map(({ name, ...state }) =>
            [null, new Time(14, 30)].map((value) => (
              <div key={`${name}-${!!value}`} style={{ width: 200 }}>
                <TimeField
                  label="Start time"
                  description="In Westmere time."
                  size={size}
                  defaultValue={value}
                  {...state}
                />
              </div>
            ))
          )}
        </div>
      ))}
      <div style={{ width: 200 }}>
        <TimeField label="Start time" isRequired />
      </div>
    </div>
  ),
};
