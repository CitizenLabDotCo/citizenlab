import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { backofficeRedesignHandlers } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { PageSaveProvider } from '../_shared/PageSaveContext';

import DeleteEventButton from './DeleteEventButton';

// The red delete link stuck to the bottom of the event setup panel. It
// asks for confirmation before it deletes the event.

const meta = {
  title: 'Components/Redesigned/Events/Delete event button',
  tags: ['bo', 'redesigned'],
  component: DeleteEventButton,
  parameters: { msw: backofficeRedesignHandlers },
  args: { projectId: project1.id, eventId: 'bo-event-1' },
  decorators: [
    (Story) => (
      <PageSaveProvider>
        <div
          style={{
            width: 560,
            padding: '0 18px',
            boxSizing: 'border-box',
            background: 'white',
          }}
        >
          <Story />
        </div>
      </PageSaveProvider>
    ),
  ],
} satisfies Meta<typeof DeleteEventButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
