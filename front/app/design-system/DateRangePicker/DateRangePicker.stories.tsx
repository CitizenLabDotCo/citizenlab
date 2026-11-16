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
  args: {
    label: 'Phase dates',
    description: 'Residents see these on the timeline.',
  },
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

export const Default: Story = {};

const filled = {
  start: parseDate('2026-11-14'),
  end: parseDate('2026-11-30'),
};

export const Open: Story = {
  args: { defaultOpen: true, defaultValue: filled },
};

const states = [
  { name: 'Default' },
  {
    name: 'Invalid',
    isInvalid: true,
    errorMessage: 'End after the start date.',
  },
  { name: 'Disabled', isDisabled: true },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      {([36, 32] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {states.map(({ name, ...state }) =>
            [null, filled].map((value) => (
              <DateRangePicker
                key={`${name}-${!!value}`}
                label="Phase dates"
                description="Residents see these on the timeline."
                size={size}
                defaultValue={value}
                {...state}
              />
            ))
          )}
        </div>
      ))}
      <DateRangePicker label="Phase dates" isRequired />
    </div>
  ),
};

// A day-press picker with simple demo rules: a press before the start or on a
// full range starts again, a later press sets the end.
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
  defaultOpen?: boolean;
  withTimes?: boolean;
  note?: string;
  isDisabled?: boolean;
};

const DayPressDemo = ({
  initialValue,
  defaultOpen,
  withTimes = true,
  note,
  isDisabled,
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
      label="Phase dates"
      description="Residents see these on the timeline."
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
      defaultOpen={defaultOpen}
      isDisabled={isDisabled}
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

export const DayPressEmpty: Story = {
  render: () => <DayPressDemo initialValue={null} />,
};

export const DayPressOpenEnded: Story = {
  render: () => (
    <DayPressDemo initialValue={{ start: nov(9, 9), end: null }} defaultOpen />
  ),
};

export const DayPressRangeWithTimes: Story = {
  render: () => (
    <DayPressDemo
      initialValue={{ start: nov(9, 9), end: nov(20, 17, 30) }}
      defaultOpen
    />
  ),
};

export const DayPressOneDayWithNote: Story = {
  render: () => (
    <DayPressDemo
      initialValue={{ start: nov(12, 0), end: nov(13, 0) }}
      withTimes={false}
      note="A one-day phase runs from midnight to midnight."
      defaultOpen
    />
  ),
};

export const DayPressDisabled: Story = {
  render: () => (
    <DayPressDemo
      initialValue={{ start: nov(9, 9), end: nov(20, 17, 30) }}
      isDisabled
    />
  ),
};
