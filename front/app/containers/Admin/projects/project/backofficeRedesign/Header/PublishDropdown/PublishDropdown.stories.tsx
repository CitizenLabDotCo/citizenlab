import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';
import { IProjectAttributes, IProjectData } from 'api/projects/types';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import PublishDropdown from '.';

// The Publish button on the right of the project header. Its label and
// colour follow the project's state (Publish, Scheduled, Live with a green
// dot, Archived with a grey one); it opens the publish panel.

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
  title: 'Components/Redesigned/Project header/Publish dropdown',
  tags: ['bo', 'redesigned'],
  component: PublishDropdown,
  parameters: { msw: backofficeRedesignHandlers },
  args: {
    project: projectWith({ publication_status: 'draft' }),
    opened: false,
    onOpenChange: fn(),
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 420,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ position: 'relative', display: 'flex' }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof PublishDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A draft: the primary Publish button. */
export const Default: Story = {};

/** Live: the status style with a green dot. */
export const Live: Story = {
  args: { project: projectWith({ publication_status: 'published' }) },
};

/** Scheduled to go live. */
export const Scheduled: Story = {
  args: {
    project: projectWith({
      publication_status: 'draft',
      scheduled_at: inDays(7),
    }),
  },
};

/** Archived: a grey dot. */
export const Archived: Story = {
  args: { project: projectWith({ publication_status: 'archived' }) },
};

/** Opened on a draft. */
export const Open: Story = {
  args: { opened: true },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 640 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '128');
  },
};

export const RTL: Story = {
  args: { opened: true },
  globals: { lang: 'ar' },
  decorators: Open.decorators,
};
