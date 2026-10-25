import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  inputManagerHandlers,
  managedIdea,
  managedIdeas,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import AssigneeProperty from './AssigneeProperty';

// The assignee line of the input side panel: who handles the input, and the menu to assign someone else.

const meta = {
  title: 'Components/Redesigned/Input manager/Assignee property',
  tags: ['bo', 'redesigned'],
  component: AssigneeProperty,
  parameters: { msw: inputManagerHandlers },
  args: { idea: managedIdea },
  decorators: [
    (Story, { parameters }) => (
      <div
        style={{
          width: 592,
          maxWidth: '100%',
          // Room below for a menu, only where one is open: a taller box
          // centred in a small card pushes the closed field out of view.
          minHeight: parameters.menuOpen ? 320 : undefined,
        }}
      >
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Test Go Vocal');
  },
} satisfies Meta<typeof AssigneeProperty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Another input, with other values. */
export const OtherInput: Story = {
  args: { idea: managedIdeas[1] },
  // An empty play: `undefined` would keep the meta's English wait.
  play: async () => {},
};

export const Open: Story = {
  parameters: { menuOpen: true },
  play: async (context) => {
    await meta.play(context);
    await userEvent.click(
      within(context.canvasElement).getByRole('button', {
        name: /Test Go Vocal/,
      })
    );
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  // An empty play: `undefined` would keep the meta's English wait.
  play: async () => {},
};
