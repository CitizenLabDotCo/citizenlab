import React, { useState } from 'react';

import { CalendarDate, parseDate } from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';

import DatePicker from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Date picker',
  component: DatePicker,
  args: { label: 'Start date', value: null, onChange: () => {} },
  decorators: [
    (Story) => (
      <I18nProvider locale="en-GB">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

type DemoProps = Omit<
  React.ComponentProps<typeof DatePicker>,
  'value' | 'onChange'
> & { initialValue: CalendarDate | null };

const Demo = ({ initialValue, ...props }: DemoProps) => {
  const [value, setValue] = useState(initialValue);
  return <DatePicker {...props} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: (args) => <Demo {...args} initialValue={null} />,
};

const states = [
  { name: 'Default' },
  {
    name: 'Invalid',
    isInvalid: true,
    errorMessage: 'Add a start date to publish.',
  },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      {states.map(({ name, ...state }) =>
        [null, parseDate('2026-11-14')].map((value) => (
          <div key={`${name}-${!!value}`} style={{ width: 200 }}>
            <Demo label="Start date" initialValue={value} {...state} />
          </div>
        ))
      )}
    </div>
  ),
};
