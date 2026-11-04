import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { waitForElement } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  EventFormHarness,
  eventStoryHandlers,
  onlineEvent,
} from '../../../../../../../.storybook/mocks/backofficeRedesignEvents';

import RegistrationCard from './RegistrationCard';

// The registration card of the setup panel: a toggle to limit how many can
// register, and one to use a custom register button with its own link and
// text.

interface StoryArgs {
  eventId?: string;
}

const meta = {
  title: 'Components/Redesigned/Events/Registration card',
  tags: ['bo', 'redesigned'],
  parameters: { msw: eventStoryHandlers },
  args: { eventId: undefined },
  render: ({ eventId }) => (
    <EventFormHarness eventId={eventId}>
      {(form) => <RegistrationCard form={form} />}
    </EventFormHarness>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: 560, padding: 18, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForElement(canvasElement, 'input[type="checkbox"]');
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new event: both toggles off. */
export const Default: Story = {};

/** Registration limited to 30 people. */
export const WithLimit: Story = {
  args: { eventId: 'bo-event-1' },
  play: async ({ canvasElement }) => {
    await waitForElement(canvasElement, 'input#maximum_attendees');
  },
};

/** A custom register button, with its link and text. */
export const CustomButton: Story = {
  args: { eventId: onlineEvent.id },
  play: async ({ canvasElement }) => {
    await waitForElement(canvasElement, 'input#event-custom-button-link');
  },
};

export const RTL: Story = {
  args: { eventId: onlineEvent.id },
  globals: { lang: 'ar' },
};
