import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import OfflineCollection from './OfflineCollection';

// The offline collection card of the input manager's right column: import
// inputs from a file, or add one by hand.

const meta = {
  title: 'Components/Redesigned/Input manager/Offline collection',
  tags: ['bo', 'redesigned'],
  component: OfflineCollection,
  parameters: { msw: backofficeRedesignHandlers },
  args: { project: project1, phase: ideationPhase },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Offline collection');
  },
} satisfies Meta<typeof OfflineCollection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
  // An empty play: `undefined` would keep the meta's English wait.
  play: async () => {},
};
