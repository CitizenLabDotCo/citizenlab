import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  inputManagerHandlers,
  managedIdea,
  managedIdeas,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import TagsProperty from './TagsProperty';

// The tags line of the input side panel: the input's tags as removable chips, and a menu to add more.

const meta = {
  title: 'Components/Redesigned/Input manager/Tags property',
  tags: ['bo', 'redesigned'],
  component: TagsProperty,
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
    await waitForText(canvasElement, 'Add tag');
  },
} satisfies Meta<typeof TagsProperty>;

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
  play: async (context) => {
    await meta.play(context);
    await userEvent.click(
      within(context.canvasElement).getByRole('button', { name: /Add tag/ })
    );
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  // An empty play: `undefined` would keep the meta's English wait.
  play: async () => {},
};
