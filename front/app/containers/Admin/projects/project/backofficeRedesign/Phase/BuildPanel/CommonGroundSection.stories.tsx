import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  commonGroundPhase,
  timelineAndPhasesHandlers,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import CommonGroundSection from './CommonGroundSection';

// The common ground part of the phase build panel: create an input, or
// start from inputs of an earlier phase.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Common ground section',
  tags: ['bo', 'redesigned'],
  component: CommonGroundSection,
  parameters: { msw: timelineAndPhasesHandlers },
  args: { projectId: project1.id, phaseId: commonGroundPhase.id },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Inputs');
  },
} satisfies Meta<typeof CommonGroundSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
