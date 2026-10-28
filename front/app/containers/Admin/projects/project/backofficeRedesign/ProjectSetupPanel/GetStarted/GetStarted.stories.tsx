import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  draftProject,
  noPhasesHandler,
  pageLayoutDisabledHandler,
  projectWith,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignSetupPanel';

import GetStarted from '.';

// The checklist on top of the setup panel while a project is a draft:
// five steps from building the project page to publishing, with a count.

const meta = {
  title: 'Components/Redesigned/Setup panel/Get started',
  tags: ['bo', 'redesigned'],
  component: GetStarted,
  parameters: { msw: backofficeRedesignHandlers },
  args: {
    project: draftProject,
    onOpenSettings: fn(),
    onOpenDropdown: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 292, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '3 of 5');
  },
} satisfies Meta<typeof GetStarted>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Page built, settings seen, a phase added: three of five done. */
export const Default: Story = {};

/** A brand new project: nothing done yet. */
export const Empty: Story = {
  args: {
    project: projectWith({
      publication_status: 'draft',
      completed_setup_steps: [],
    }),
  },
  parameters: {
    msw: [noPhasesHandler, pageLayoutDisabledHandler, ...backofficeRedesignHandlers],
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '0 of 5');
  },
};

/** Everything but publishing. */
export const ReadyToPublish: Story = {
  args: {
    project: projectWith({
      publication_status: 'draft',
      completed_setup_steps: ['settings', 'share'],
    }),
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '4 of 5');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '3');
  },
};
