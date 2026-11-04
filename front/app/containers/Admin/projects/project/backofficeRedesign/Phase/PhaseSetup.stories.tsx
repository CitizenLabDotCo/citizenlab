import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  infoPhase,
  votingPhase,
  waitForElement,
  waitForText,
  withAllLocales,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { PageSaveProvider } from '../_shared/PageSaveContext';

import PhaseSetup from './PhaseSetup';

// The build panel of a phase: its method, dates, description and files.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Phase setup',
  tags: ['bo', 'redesigned'],
  component: PhaseSetup,
  parameters: { msw: backofficeRedesignHandlers },
  args: { projectId: project1.id, phase: ideationPhase },
  decorators: [
    (Story) => (
      <PageSaveProvider>
        <div style={{ width: 560, background: 'white' }}>
          <Story />
        </div>
      </PageSaveProvider>
    ),
    withAllLocales,
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Phase name');
  },
} satisfies Meta<typeof PhaseSetup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An ideation phase. */
export const Default: Story = {};

/** An information phase. */
export const Information: Story = {
  args: { phase: infoPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Phase name');
  },
};

/** A voting phase. */
export const Voting: Story = {
  args: { phase: votingPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Phase name');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    await waitForElement(canvasElement, 'input');
  },
};
