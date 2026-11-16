import React, { useState } from 'react';

import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
} from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';

import Calendar, { OpenRangeValue, RangeCalendar } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Calendar',
  component: Calendar,
  decorators: [
    (Story) => (
      <I18nProvider locale="en-GB">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Calendar
      defaultValue={parseDate('2026-11-20')}
      minValue={today(getLocalTimeZone())}
    />
  ),
};

export const Range: Story = {
  render: () => (
    <RangeCalendar
      defaultValue={{
        start: parseDate('2026-11-16'),
        end: parseDate('2026-11-27'),
      }}
    />
  ),
};

export const Unavailable: Story = {
  render: () => (
    <Calendar
      defaultValue={parseDate('2026-11-20')}
      isDateUnavailable={(date) => date.day % 7 === 0}
    />
  ),
};

type DayPressDemoProps = {
  initialValue: OpenRangeValue<CalendarDate> | null;
};

// Demo rules: a press on or before the start, or on a full range, starts again.
const DayPressDemo = ({ initialValue }: DayPressDemoProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <RangeCalendar
      value={value}
      onDayPress={(day) =>
        setValue(
          !value || value.end || day.compare(value.start) <= 0
            ? { start: day, end: null }
            : { start: value.start, end: day }
        )
      }
      defaultFocusedValue={parseDate('2026-11-01')}
      isDateUnavailable={(date) => date.day >= 3 && date.day <= 6}
      aria-label="Phase dates"
    />
  );
};

export const DayPressOpenEnded: Story = {
  render: () => (
    <DayPressDemo
      initialValue={{ start: parseDate('2026-11-16'), end: null }}
    />
  ),
};

export const DayPressRange: Story = {
  render: () => (
    <DayPressDemo
      initialValue={{
        start: parseDate('2026-11-16'),
        end: parseDate('2026-11-27'),
      }}
    />
  ),
};
