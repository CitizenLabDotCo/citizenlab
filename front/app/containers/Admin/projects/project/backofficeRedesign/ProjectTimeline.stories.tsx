import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  noEventsHandler,
  waitForText,
} from '../../../../../../.storybook/mocks/backofficeRedesign';

import ProjectTimeline from './ProjectTimeline';

// The right-hand panel of project setup: the participation methods on the
// timeline, then the project's events.

const meta = {
  title: 'Components/Redesigned/Project timeline',
  tags: ['bo'],
  component: ProjectTimeline,
  parameters: { msw: backofficeRedesignHandlers },
  args: { projectId: project1.id },
  decorators: [
    (Story) => (
      <div style={{ width: 332, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Collect ideas');
    await waitForText(canvasElement, 'Walk along the tree route');
  },
} satisfies Meta<typeof ProjectTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three phases (past, current, future) and two events. */
export const Default: Story = {};

/** Phases but no events yet. */
export const NoEvents: Story = {
  parameters: { msw: [noEventsHandler, ...backofficeRedesignHandlers] },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Collect ideas');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Collect ideas');
  },
};
