import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  infoPhase,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  infoPhaseWithReport,
  timelineAndPhasesHandlers,
} from '../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import ReportSection from './ReportSection';

// The report of an information phase in its build panel: whether it is
// visible, buttons to edit or view it, or how to create one.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Report section',
  tags: ['bo', 'redesigned'],
  component: ReportSection,
  parameters: { msw: timelineAndPhasesHandlers },
  args: { projectId: project1.id, phase: infoPhaseWithReport },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Visible');
  },
} satisfies Meta<typeof ReportSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A hidden report, with the visibility warning. */
export const Default: Story = {};

/** No report yet: what a report is for, and a button to create one. */
export const Empty: Story = {
  args: { phase: infoPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Create a report to:');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
