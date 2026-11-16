import React from 'react';

import { parseDate } from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';

import DateField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Date field',
  component: DateField,
  args: { label: 'Start date', description: 'The phase opens at 00:00.' },
  decorators: [
    (Story) => (
      <I18nProvider locale="en-GB">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const states = [
  { name: 'Default' },
  {
    name: 'Invalid',
    isInvalid: true,
    errorMessage: 'Add a start date to publish.',
  },
  { name: 'Disabled', isDisabled: true },
  { name: 'Read-only', isReadOnly: true },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      {([36, 32] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 24 }}>
          {states.map(({ name, ...state }) =>
            [null, parseDate('2026-11-14')].map((value) => (
              <div key={`${name}-${!!value}`} style={{ width: 200 }}>
                <DateField
                  label="Start date"
                  description="The phase opens at 00:00."
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
        <DateField label="Start date" isRequired />
      </div>
    </div>
  ),
};
