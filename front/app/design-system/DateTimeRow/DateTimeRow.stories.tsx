import React, { useState } from 'react';

import { CalendarDate, parseDate, Time } from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';

import DateRow from './DateRow';
import TimeRangeRow from './TimeRangeRow';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Date and time row',
  decorators: [
    (Story) => (
      <I18nProvider locale="en-US">
        <div style={{ width: 488, display: 'grid', gap: 16 }}>
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DateDemo = ({ initialValue }: { initialValue: CalendarDate | null }) => {
  const [value, setValue] = useState(initialValue);
  return (
    <DateRow
      aria-label="Date"
      placeholder="Add a date"
      value={value}
      onChange={setValue}
    />
  );
};

const TimeDemo = ({
  initialStart,
  initialEnd,
  errorMessage,
}: {
  initialStart: Time | null;
  initialEnd: Time | null;
  errorMessage?: string;
}) => {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  return (
    <TimeRangeRow
      aria-label="Time"
      start={{ 'aria-label': 'Start time', value: start, onChange: setStart }}
      end={{ 'aria-label': 'End time', value: end, onChange: setEnd }}
      errorMessage={errorMessage}
    />
  );
};

export const AllVariants: Story = {
  render: () => (
    <>
      <DateDemo initialValue={null} />
      <DateDemo initialValue={parseDate('2026-12-04')} />
      <TimeDemo initialStart={null} initialEnd={null} />
      <TimeDemo initialStart={new Time(18)} initialEnd={new Time(20)} />
      <TimeDemo
        initialStart={new Time(18)}
        initialEnd={new Time(17)}
        errorMessage="The end time is before the start time."
      />
    </>
  ),
};
