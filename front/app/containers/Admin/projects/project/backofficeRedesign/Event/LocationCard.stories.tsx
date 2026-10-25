import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import {
  waitForElement,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  EventFormHarness,
  eventStoryHandlers,
  longEvent,
  multiDayEvent,
  onlineEvent,
} from '../../../../../../../.storybook/mocks/backofficeRedesignEvents';

import LocationCard from './LocationCard';

// The event location card of the setup panel: an online link, the address
// with its spot on a map, and extra details on how to find the place.

interface StoryArgs {
  eventId?: string;
}

const meta = {
  title: 'Components/Redesigned/Events/Location card',
  tags: ['bo', 'redesigned'],
  parameters: { msw: eventStoryHandlers },
  args: { eventId: 'bo-event-1' },
  render: ({ eventId }) => (
    <EventFormHarness eventId={eventId}>
      {(form) => <LocationCard form={form} />}
    </EventFormHarness>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: 524, padding: 18, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForElement(canvasElement, 'input#event-online-link');
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An event in a park, shown on the map. */
export const Default: Story = {};

/** A new event, nothing filled in. */
export const Empty: Story = {
  args: { eventId: undefined },
};

/** Online only. */
export const Online: Story = {
  args: { eventId: onlineEvent.id },
};

/** With directions in the address details. */
export const WithDetails: Story = {
  args: { eventId: multiDayEvent.id },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'blue tent');
  },
};

export const LongContent: Story = {
  args: { eventId: longEvent.id },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
