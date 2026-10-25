import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  inputManagerHandlers,
  managedIdea,
  managedIdeas,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import StatusProperty from './StatusProperty';

// The status line of the input side panel: the current status with its colour, and the menu to change it.

const meta = {
  title: 'Components/Redesigned/Input manager/Status property',
  tags: ['bo', 'redesigned'],
  component: StatusProperty,
  parameters: { msw: inputManagerHandlers },
  args: { type: 'ProjectIdeas', idea: managedIdea },
  decorators: [
    (Story) => (
      <div style={{ width: 592, maxWidth: "100%", minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Proposed');
  },
} satisfies Meta<typeof StatusProperty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Another input, with other values. */
export const OtherInput: Story = {
  args: { idea: managedIdeas[1] },
  play: undefined,
};

export const Open: Story = {
  play: async (context) => {
    await meta.play(context);
    await userEvent.click(
      within(context.canvasElement).getByRole('button', { name: /Proposed/ })
    );
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: undefined,
};
