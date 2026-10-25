import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { t } from 'design-system/tokens/tokens';
import { waitFor } from 'storybook/test';

import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData } from 'api/phases/types';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { MemoryRouter } from 'utils/router';

import ProjectWorkspace from '.';

// The redesigned project workspace, with stand-ins in its slots.

const emptyPhase: IPhaseData = {
  ...mockPhaseIdeationData,
  attributes: { ...mockPhaseIdeationData.attributes, ideas_count: 0 },
};

const projectPath = `/admin/projects/${project1.id}`;
const phasePath = `${projectPath}/phases/${emptyPhase.id}`;

// Stand-ins for the content the routes put in the slots.
const Slot = ({ label }: { label: string }) => (
  <div style={{ padding: t.space[4], color: t.color.textSecondary }}>
    {label}
  </div>
);

const meta = {
  title: 'Pages/Project workspace',
  tags: ['bo', 'redesigned'],
  parameters: { gv: {}, layout: 'fullscreen' },
  component: ProjectWorkspace,
  args: {
    project: project1,
    children: <Slot label="Page content" />,
  },
  decorators: [
    (Story, { parameters }) => (
      <MemoryRouter initialEntries={[parameters.path ?? projectPath]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  // The header shows the project title once the app configuration and
  // the project (MSW) have loaded.
  play: async ({ canvasElement }) => {
    await waitFor(
      () => {
        if (!canvasElement.textContent.includes('Choose where to plant')) {
          throw new Error('workspace header not rendered yet');
        }
      },
      { timeout: 10000 }
    );
  },
} satisfies Meta<typeof ProjectWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Project setup: settings panel, page content and the timeline panel. */
export const Default: Story = {
  args: { sidePanel: <Slot label="Timeline" /> },
};

/** A phase with no inputs on its Insights view: the empty state. */
export const InsightsEmpty: Story = {
  args: { phase: emptyPhase },
  parameters: { path: `${phasePath}/insights` },
};

/** A phase with no inputs on its Manage view. */
export const ManageEmpty: Story = {
  args: { phase: emptyPhase },
  parameters: { path: `${phasePath}/ideas` },
};

export const RTL: Story = {
  ...InsightsEmpty,
  globals: { lang: 'ar' },
};
