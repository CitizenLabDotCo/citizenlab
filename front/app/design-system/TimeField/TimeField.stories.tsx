import React, { useState } from 'react';

import { Time } from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';

import TimeField from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Time field',
  component: TimeField,
  args: {
    label: 'Start time',
    description: 'In Westmere time.',
    value: null,
    onChange: () => {},
  },
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

type DemoProps = Omit<
  React.ComponentProps<typeof TimeField>,
  'value' | 'onChange'
> & { initialValue: Time | null };

const Demo = ({ initialValue, ...props }: DemoProps) => {
  const [value, setValue] = useState(initialValue);
  return <TimeField {...props} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: (args) => <Demo {...args} initialValue={null} />,
};

const states = [
  { name: 'Default' },
  { name: 'Invalid', isInvalid: true, errorMessage: 'Add a start time.' },
  { name: 'Disabled', isDisabled: true },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      {([36, 32] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 24 }}>
          {states.map(({ name, ...state }) =>
            [null, new Time(14, 30)].map((value) => (
              <div key={`${name}-${!!value}`} style={{ width: 200 }}>
                <Demo
                  label="Start time"
                  description="In Westmere time."
                  size={size}
                  initialValue={value}
                  {...state}
                />
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  ),
};
