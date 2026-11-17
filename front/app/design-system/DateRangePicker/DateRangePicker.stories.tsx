import React, { useState } from 'react';

import {
  CalendarDate,
  CalendarDateTime,
  parseDate,
  Time,
  toCalendarDate,
  toTime,
} from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';

import { OpenRangeValue } from '../Calendar';

import DateRangePicker from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Date range picker',
  component: DateRangePicker,
  decorators: [
    (Story) => (
      <I18nProvider locale="en-GB">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

// Simple demo rules: a press before the start or on a full range starts
// again, a later press sets the end.
const pressDay = (
  value: OpenRangeValue<CalendarDateTime> | null,
  day: CalendarDate
): OpenRangeValue<CalendarDateTime> => {
  const at = (hour: number, minute: number) =>
    new CalendarDateTime(day.year, day.month, day.day, hour, minute);

  if (!value || value.end || day.compare(toCalendarDate(value.start)) <= 0) {
    return { start: at(9, 0), end: null };
  }
  return { start: value.start, end: at(17, 30) };
};

type DayPressDemoProps = {
  initialValue: OpenRangeValue<CalendarDateTime> | null;
  withTimes?: boolean;
  note?: string;
};

const DayPressDemo = ({
  initialValue,
  withTimes = true,
  note,
}: DayPressDemoProps) => {
  const [value, setValue] = useState(initialValue);

  const setTime = (part: 'start' | 'end', time: Time) => {
    if (!value) return;
    if (part === 'start') {
      setValue({ ...value, start: value.start.set(time) });
    } else if (value.end) {
      setValue({ ...value, end: value.end.set(time) });
    }
  };

  return (
    <DateRangePicker
      aria-label="Phase dates"
      value={value}
      onDayPress={(day) => setValue(pressDay(value, day))}
      startPlaceholder="Select date"
      endPlaceholder={value ? 'Open ended' : 'Select date'}
      isDateUnavailable={(date) =>
        date.month === 11 && date.day >= 3 && date.day <= 6
      }
      minValue={parseDate('2026-01-01')}
      maxValue={parseDate('2027-12-31')}
      defaultFocusedValue={parseDate('2026-11-01')}
      startTime={
        withTimes
          ? {
              label: 'Start time',
              value: value ? toTime(value.start) : new Time(0, 0),
              minValue: new Time(8, 0),
              onChange: (time) => setTime('start', time),
            }
          : undefined
      }
      endTime={
        withTimes
          ? {
              label: 'End time',
              value: value?.end ? toTime(value.end) : null,
              isDisabled: !value?.end,
              description: value?.end ? undefined : 'Open ended',
              onChange: (time) => setTime('end', time),
            }
          : undefined
      }
      calendarNote={note}
    />
  );
};

const nov = (day: number, hour: number, minute = 0) =>
  new CalendarDateTime(2026, 11, day, hour, minute);

export const Empty: Story = {
  render: () => <DayPressDemo initialValue={null} />,
};

export const OpenEnded: Story = {
  render: () => <DayPressDemo initialValue={{ start: nov(9, 9), end: null }} />,
};

export const RangeWithTimes: Story = {
  render: () => (
    <DayPressDemo initialValue={{ start: nov(9, 9), end: nov(20, 17, 30) }} />
  ),
};

export const OneDayWithNote: Story = {
  render: () => (
    <DayPressDemo
      initialValue={{ start: nov(12, 0), end: nov(13, 0) }}
      withTimes={false}
      note="A one-day phase runs from midnight to midnight."
    />
  ),
};
