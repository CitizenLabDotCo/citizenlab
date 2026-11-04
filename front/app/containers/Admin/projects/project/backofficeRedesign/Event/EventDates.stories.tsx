import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { backofficeRedesignHandlers } from '../../../../../../../.storybook/mocks/backofficeRedesign';

import EventDates from './EventDates';

// The event dates card of the setup panel: the date, the start and end
// times, a link to add an end date, and a note on the platform's time zone.

const at = (daysFromNow: number, hour: number, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minutes, 0, 0);
  return d.toISOString();
};

const meta = {
  title: 'Components/Redesigned/Events/Event dates',
  tags: ['bo', 'redesigned'],
  component: EventDates,
  parameters: { msw: backofficeRedesignHandlers },
  args: {
    startAt: at(12, 10),
    endAt: at(12, 12, 30),
    errors: null,
    setAttributeDiff: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560, padding: 18, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventDates>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A morning event on one day. */
export const Default: Story = {};

/** An event over three days shows the end date too. */
export const MultiDay: Story = {
  args: { startAt: at(20, 9), endAt: at(22, 17) },
};

/** The server turned the dates down. */
export const WithErrors: Story = {
  args: {
    errors: {
      end_at: [{ error: 'after_start_at' }],
    },
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
