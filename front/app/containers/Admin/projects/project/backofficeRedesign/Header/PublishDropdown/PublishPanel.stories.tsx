import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';
import { IProjectAttributes, IProjectData } from 'api/projects/types';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import PublishPanel from './PublishPanel';

// The panel inside the Publish dropdown: the project's state, who can find
// and open it, the email to followers, and the publish, schedule, draft or
// archive buttons for that state.

const projectWith = (attributes: Partial<IProjectAttributes>): IProjectData => ({
  ...project1,
  attributes: { ...project1.attributes, ...attributes },
});

const inDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
};

const meta = {
  title: 'Components/Redesigned/Project header/Publish panel',
  tags: ['bo', 'redesigned'],
  component: PublishPanel,
  parameters: { msw: backofficeRedesignHandlers },
  args: {
    project: projectWith({ publication_status: 'draft' }),
    onSchedule: fn(),
    onConfirmStatusChange: fn(),
    onDone: fn(),
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 380,
          padding: 16,
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '128');
  },
} satisfies Meta<typeof PublishPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A draft: schedule or publish now. */
export const Default: Story = {};

/** A live project: back to draft, or archive. */
export const Published: Story = {
  args: { project: projectWith({ publication_status: 'published' }) },
};

/** Scheduled to go live: the date and time in the header. */
export const Scheduled: Story = {
  args: {
    project: projectWith({
      publication_status: 'draft',
      scheduled_at: inDays(7),
    }),
  },
};

/** Archived: only back to draft. */
export const Archived: Story = {
  args: { project: projectWith({ publication_status: 'archived' }) },
};

/** Unlisted and for selected groups only: the email toggle is off. */
export const UnlistedPrivate: Story = {
  args: {
    project: projectWith({
      publication_status: 'draft',
      listed: false,
      visible_to: 'groups',
    }),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
