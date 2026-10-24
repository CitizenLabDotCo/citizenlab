import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  noEventsHandler,
  waitForText,
} from '../../../../../../.storybook/mocks/backofficeRedesign';

import TimelineEvents from './TimelineEvents';

// The events list under the project timeline: an upcoming and a past event,
// each with its date, and the button to add one.

const meta = {
  title: 'Components/Redesigned/Timeline events',
  tags: ['bo'],
  component: TimelineEvents,
  parameters: { msw: backofficeRedesignHandlers },
  args: { projectId: project1.id },
  decorators: [
    (Story) => (
      <div style={{ width: 332, padding: 12, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Neighbourhood workshop');
  },
} satisfies Meta<typeof TimelineEvents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** No events yet: the heading and the add button. */
export const Empty: Story = {
  parameters: { msw: [noEventsHandler, ...backofficeRedesignHandlers] },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Events');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
