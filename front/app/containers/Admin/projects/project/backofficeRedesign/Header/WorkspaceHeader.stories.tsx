import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { PageSaveProvider } from '../_shared/PageSaveContext';

import WorkspaceHeader from '.';

// The bar on top of the redesigned project workspace: breadcrumbs, the
// phase's view switch, and preview, share and publish, or save in a phase.

const meta = {
  title: 'Components/Redesigned/Project header/Workspace header',
  tags: ['bo', 'redesigned'],
  component: WorkspaceHeader,
  parameters: { layout: 'fullscreen', msw: backofficeRedesignHandlers },
  args: {
    project: project1,
    activeView: 'build',
    openDropdown: null,
    onOpenDropdown: fn(),
  },
  decorators: [
    (Story) => (
      <PageSaveProvider>
        <div style={{ padding: 8, minHeight: 120 }}>
          <Story />
        </div>
      </PageSaveProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Choose where to plant');
  },
} satisfies Meta<typeof WorkspaceHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Project setup: breadcrumbs, preview, share and publish. */
export const Default: Story = {};

/** In a phase: back button, phase crumb, the view switch and save. */
export const Phase: Story = {
  args: { phase: ideationPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Collect ideas');
  },
};

/** A new phase that is not saved yet: its draft label and save. */
export const NewPhaseDraft: Story = {
  args: { draftLabel: 'New phase', saveLabel: 'Create phase' },
};

/** The share dropdown opened: who has access and the preview link. */
export const ShareOpen: Story = {
  args: { openDropdown: 'share' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 560 }}>
        <Story />
      </div>
    ),
  ],
};

/** The publish dropdown opened. */
export const PublishOpen: Story = {
  args: { openDropdown: 'publish' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 560 }}>
        <Story />
      </div>
    ),
  ],
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
