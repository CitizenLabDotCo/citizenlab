import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  votingPhase,
  waitForText,
  withAllLocales,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { PageSaveProvider } from '../_shared/PageSaveContext';

import MethodSettings from './MethodSettings';

// The settings under a phase's build panel: what participants can do in
// the method, who can, and the method's options.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Method settings',
  tags: ['bo', 'redesigned'],
  component: MethodSettings,
  parameters: { msw: backofficeRedesignHandlers },
  args: { phase: ideationPhase },
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
} satisfies Meta<typeof MethodSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An ideation phase. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Submitting');
  },
};

/** A voting phase. */
export const Voting: Story = {
  args: { phase: votingPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Voting');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
