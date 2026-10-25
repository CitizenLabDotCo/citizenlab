import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  mockIdeas,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import ExportsCard from './ExportsCard';

// The exports card of the input manager's right column: download all the
// project's inputs, or only the selected ones.

const meta = {
  title: 'Components/Redesigned/Input manager/Exports card',
  tags: ['bo', 'redesigned'],
  component: ExportsCard,
  parameters: { msw: backofficeRedesignHandlers },
  args: { type: 'ProjectIdeas', projectId: project1.id, selectedIds: [] },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Exports');
  },
} satisfies Meta<typeof ExportsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Inputs are selected: the export covers only them. */
export const WithSelection: Story = {
  args: { selectedIds: mockIdeas.map((idea) => idea.id) },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: undefined,
};
