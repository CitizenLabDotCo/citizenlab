import React, { useState } from 'react';

import { CalendarDate, parseDate } from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';

import { DayPressCalendar, OpenRangeValue } from '.';

import type { Meta, StoryObj } from '@storybook/react';

// The single-day Calendar only shows inside the Date picker; see its stories.
const meta = {
  title: 'Design system/Forms/Calendar',
  component: DayPressCalendar,
  decorators: [
    (Story) => (
      <I18nProvider locale="en-GB">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof DayPressCalendar>;

export default meta;
type Story = StoryObj<typeof DayPressCalendar>;

type DayPressDemoProps = {
  initialValue: OpenRangeValue<CalendarDate> | null;
};

// Demo rules: a press on or before the start, or on a full range, starts again.
const DayPressDemo = ({ initialValue }: DayPressDemoProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <DayPressCalendar
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
