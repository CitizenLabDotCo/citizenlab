import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  EventFormHarness,
  eventStoryHandlers,
  eventWithFiles,
  longEvent,
  multiDayEvent,
  onlineEvent,
} from '../../../../../../../.storybook/mocks/backofficeRedesignEvents';

import EventPreview from './EventPreview';

// The right side of the event page: the event in a phone frame, as
// participants will see it. Parts not filled in yet show as dashed
// placeholders only admins see.

interface StoryArgs {
  eventId?: string;
  withImage?: boolean;
}

const meta = {
  title: 'Components/Redesigned/Events/Event preview',
  tags: ['bo', 'redesigned'],
  parameters: { layout: 'fullscreen', msw: eventStoryHandlers },
  args: { eventId: 'bo-event-1' },
  render: ({ eventId, withImage }) => (
    <EventFormHarness eventId={eventId} withImage={withImage}>
      {(form) => <EventPreview project={project1} form={form} />}
    </EventFormHarness>
  ),
  decorators: [
    (Story) => (
      <div style={{ height: 860, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Walk along the tree route');
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An existing event, with no image yet. */
export const Default: Story = {};

/** A new event: placeholders for the name, image and description. */
export const New: Story = {
  args: { eventId: undefined },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Only admins');
  },
};

/** With an image and two attached files. */
export const WithImageAndFiles: Story = {
  args: { eventId: eventWithFiles.id, withImage: true },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Tree route map.pdf');
  },
};

/** Online, with a custom register button. */
export const Online: Story = {
  args: { eventId: onlineEvent.id },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Save my seat');
  },
};

/** Over three days. */
export const MultiDay: Story = {
  args: { eventId: multiDayEvent.id },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Tree planting weekend');
  },
};

export const LongContent: Story = {
  args: { eventId: longEvent.id },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Second neighbourhood workshop');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
