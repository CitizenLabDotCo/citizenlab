import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  EventFormHarness,
  eventStoryHandlers,
  eventWithFiles,
  longEvent,
  onlineEvent,
} from '../../../../../../../.storybook/mocks/backofficeRedesignEvents';
import { PageSaveProvider } from '../_shared/PageSaveContext';

import EventSetup from './EventSetup';

// The left panel of the event page: the name and description, then the
// attachments, image, dates, location and registration cards, and the
// delete link at the bottom for an existing event.

interface StoryArgs {
  eventId?: string;
  withImage?: boolean;
}

const meta = {
  title: 'Components/Redesigned/Events/Event setup',
  tags: ['bo', 'redesigned'],
  parameters: { msw: eventStoryHandlers },
  args: { eventId: 'bo-event-1' },
  render: ({ eventId, withImage }) => (
    <EventFormHarness eventId={eventId} withImage={withImage}>
      {(form) => <EventSetup projectId={project1.id} form={form} />}
    </EventFormHarness>
  ),
  decorators: [
    (Story) => (
      <PageSaveProvider>
        <div style={{ width: 560, background: 'white' }}>
          <Story />
        </div>
      </PageSaveProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Event setup');
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An existing event, with its dates, place and registration limit. */
export const Default: Story = {};

/** A new event, before anything is filled in. */
export const New: Story = {
  args: { eventId: undefined },
};

/** Online, with a custom register button. */
export const Online: Story = {
  args: { eventId: onlineEvent.id },
};

/** With two files attached and an image picked. */
export const WithFilesAndImage: Story = {
  args: { eventId: eventWithFiles.id, withImage: true },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Tree route map.pdf');
  },
};

export const LongContent: Story = {
  args: { eventId: longEvent.id },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
