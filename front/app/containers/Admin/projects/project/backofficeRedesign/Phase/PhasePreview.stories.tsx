import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  waitForElement,
  withPreviewPlaceholder,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';

import PhasePreview from './PhasePreview';

// The main area of a phase's Build tab: the project page as participants
// see it, in a phone frame.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Phase preview',
  tags: ['bo', 'redesigned'],
  component: PhasePreview,
  parameters: { layout: 'fullscreen', msw: backofficeRedesignHandlers },
  args: { projectId: project1.id, phase: ideationPhase },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: 800 }}>
        <Story />
      </div>
    ),
    withPreviewPlaceholder,
  ],
  play: async ({ canvasElement }) => {
    await waitForElement(canvasElement, 'iframe');
  },
} satisfies Meta<typeof PhasePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The current phase's page. */
export const Default: Story = {};

/** No phase yet (a new phase): the project page. */
export const NoPhase: Story = {
  args: { phase: undefined },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
