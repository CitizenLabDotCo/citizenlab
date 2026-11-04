import React from 'react';

import { Icon, bo } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/TimeSelection/TimeInput';

import DateFieldRow from './DateFieldRow';
import DateFieldSegment from './DateFieldSegment';

// One bordered row of the event dates card: an icon, then the date or time
// pickers, which read as plain text segments inside it (DateFieldSegment).

const start = new Date('2026-11-06T10:00:00');
const end = new Date('2026-11-08T12:30:00');

const formatLongDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const Arrow = () => (
  <Icon
    name="arrow-right"
    width="14px"
    height="14px"
    fill={bo.colors.crumbSeparator}
  />
);

const meta = {
  title: 'Components/Redesigned/Events/Date field row',
  tags: ['bo', 'redesigned'],
  component: DateFieldRow,
  args: {
    icon: 'calendar',
    children: (
      <DateFieldSegment>
        <DateSinglePicker
          id="story-start-date"
          selectedDate={start}
          formatDate={formatLongDate}
          onChange={fn()}
        />
      </DateFieldSegment>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 500, padding: 18, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateFieldRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The start date of a one-day event. */
export const Default: Story = {};

/** The start and end dates of an event over several days. */
export const DateRange: Story = {
  args: {
    children: (
      <>
        <DateFieldSegment>
          <DateSinglePicker
            id="story-start-date"
            selectedDate={start}
            formatDate={(date) =>
              date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })
            }
            onChange={fn()}
          />
        </DateFieldSegment>
        <Arrow />
        <DateFieldSegment>
          <DateSinglePicker
            id="story-end-date"
            selectedDate={end}
            formatDate={(date) =>
              date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })
            }
            onChange={fn()}
          />
        </DateFieldSegment>
      </>
    ),
  },
};

/** The start and end times. */
export const Times: Story = {
  args: {
    icon: 'clock',
    children: (
      <>
        <DateFieldSegment>
          <TimeInput selectedTime={start} onChange={fn()} />
        </DateFieldSegment>
        <Arrow />
        <DateFieldSegment>
          <TimeInput selectedTime={end} onChange={fn()} />
        </DateFieldSegment>
      </>
    ),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
