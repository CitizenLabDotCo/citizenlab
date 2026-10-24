import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  waitForText,
  withDesktopWidth,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { PageSaveProvider } from '../_shared/PageSaveContext';

import EventWorkspace from './EventWorkspace';

// The event page of the redesigned workspace: the setup cards on the left
// and a preview of the event as participants will see it.

const meta = {
  title: 'Components/Redesigned/Event workspace',
  tags: ['bo'],
  component: EventWorkspace,
  parameters: { layout: 'fullscreen', msw: backofficeRedesignHandlers },
  args: { project: project1, onCreate: fn() },
  decorators: [
    (Story) => (
      <PageSaveProvider>
        <div style={{ height: 900, display: 'flex' }}>
          <Story />
        </div>
      </PageSaveProvider>
    ),
    withDesktopWidth,
  ],
} satisfies Meta<typeof EventWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new event, before anything is filled in. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Event setup');
  },
};

/** An existing event, with its dates, place and registration. */
export const Existing: Story = {
  args: { eventId: 'bo-event-1' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Walk along the tree route');
  },
};

export const RTL: Story = {
  args: { eventId: 'bo-event-1' },
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Walk along the tree route');
  },
};
