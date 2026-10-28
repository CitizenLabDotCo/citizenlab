import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';
import { IProjectData } from 'api/projects/types';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import ConfirmStatusChangeModal from './ConfirmStatusChangeModal';

// The confirm step before a live project goes back to draft or into the
// archive, opened from the Publish dropdown.

const archivedProject: IProjectData = {
  ...project1,
  attributes: { ...project1.attributes, publication_status: 'archived' },
};

const meta = {
  title: 'Components/Redesigned/Project header/Confirm status change modal',
  tags: ['bo', 'redesigned'],
  component: ConfirmStatusChangeModal,
  parameters: { layout: 'fullscreen' },
  args: {
    opened: true,
    status: 'draft',
    project: project1,
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: 600 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConfirmStatusChangeModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A live project back to draft. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Cancel');
  },
};

/** A live project into the archive. */
export const Archive: Story = {
  args: { status: 'archived' },
};

/** An archived project back to draft. */
export const RestoreFromArchive: Story = {
  args: { project: archivedProject },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
