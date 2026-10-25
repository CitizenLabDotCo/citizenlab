import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  inputManagerHandlers,
  managedIdeas,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import BatchBar from '.';

// The actions on the selected inputs, shown in the list toolbar once
// inputs are ticked: change status, assign, tag, copy to a phase, edit
// (one input) and delete.

const openMenu = (name: RegExp) =>
  async function play({ canvasElement }: { canvasElement: HTMLElement }) {
    await userEvent.click(within(canvasElement).getByRole('button', { name }));
  };

const meta = {
  title: 'Components/Redesigned/Input manager/Batch bar',
  tags: ['bo', 'redesigned'],
  component: BatchBar,
  parameters: { msw: inputManagerHandlers },
  args: {
    type: 'ProjectIdeas',
    projectId: project1.id,
    ideas: managedIdeas,
    onUpdated: fn(),
    onEdit: fn(),
    onClear: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 960, maxWidth: '100%', minHeight: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BatchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two inputs selected. */
export const Default: Story = {};

/** One input selected: it can also be edited. */
export const SingleInput: Story = {
  args: { ideas: managedIdeas.slice(0, 1) },
};

/** Proposals cannot be copied to another phase. */
export const Proposals: Story = {
  args: { type: 'ProjectProposals' },
};

export const StatusMenuOpen: Story = {
  play: async (context) => {
    await openMenu(/^Status$/)(context);
    await waitForText(context.canvasElement, 'Proposed');
  },
};

export const AssignMenuOpen: Story = {
  play: async (context) => {
    await openMenu(/^Assign$/)(context);
    await waitForText(context.canvasElement, 'Unassigned');
  },
};

/** One input has the tag Trees, both have Shade. */
export const TagsMenuOpen: Story = {
  play: async (context) => {
    await openMenu(/^Tags$/)(context);
    await waitForText(context.canvasElement, 'Mobility');
  },
};

export const CopyToPhaseMenuOpen: Story = {
  play: async (context) => {
    await openMenu(/^Copy to phase$/)(context);
    await waitForText(context.canvasElement, 'Choose the places');
  },
};

export const DeleteConfirmation: Story = {
  play: async (context) => {
    await openMenu(/Delete/)(context);
    await waitForText(document.body, 'Cancel');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
