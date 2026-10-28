import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { projectWith } from '../../../../../../../.storybook/mocks/backofficeRedesignSetupPanel';

import NextActions from './NextActions';

// The block on top of the setup panel once a project is live: the
// participants graph and links to what to do next.

const meta = {
  title: 'Components/Redesigned/Setup panel/Next actions',
  tags: ['bo', 'redesigned'],
  component: NextActions,
  parameters: { msw: backofficeRedesignHandlers },
  args: { project: project1 },
  decorators: [
    (Story) => (
      <div style={{ width: 292, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '31');
  },
} satisfies Meta<typeof NextActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live, with participants: the graph and the next actions. */
export const Default: Story = {};

/** Collecting now: an active project that has participants. */
export const CollectingNow: Story = {
  args: { project: projectWith({ participation_status: 'active' }) },
};

/** Live but nobody took part yet: no graph. */
export const NoParticipants: Story = {
  args: { project: projectWith({ participants_count: 0 }) },
  play: async () => {},
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
