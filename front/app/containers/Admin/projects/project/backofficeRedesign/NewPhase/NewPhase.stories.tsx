import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { MemoryRouter } from 'utils/router';

import {
  backofficeRedesignHandlers,
  waitForText,
  withAllLocales,
  withDesktopWidth,
  withPreviewPlaceholder,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { PageSaveProvider } from '../_shared/PageSaveContext';

import NewPhase from '.';

// Adding a phase: first the method picker over the workspace, then the new
// phase's setup with its method settings, before it is saved.

const at = (search: string) => (Story: React.ComponentType) =>
  (
    <MemoryRouter
      initialEntries={[`/admin/projects/${project1.id}/phases/new${search}`]}
    >
      <PageSaveProvider>
        <div style={{ minHeight: 900 }}>
          <Story />
        </div>
      </PageSaveProvider>
    </MemoryRouter>
  );

const meta = {
  title: 'Components/Redesigned/New phase',
  tags: ['bo'],
  component: NewPhase,
  parameters: { layout: 'fullscreen', msw: backofficeRedesignHandlers },
  args: { project: project1 },
  decorators: [withAllLocales, withPreviewPlaceholder, withDesktopWidth],
} satisfies Meta<typeof NewPhase>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An ideation phase picked, not saved yet. */
export const Default: Story = {
  decorators: [at('?participation_method=ideation')],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'New phase');
  },
};

/** No method picked yet: the method picker. */
export const PickMethod: Story = {
  decorators: [at('')],
  play: async () => {
    await waitForText(document.body, 'Participation methods');
  },
};

export const RTL: Story = {
  decorators: [at('?participation_method=ideation')],
  globals: { lang: 'ar' },
};
