import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import OptionList from '../OptionList';

import BatchMenuButton from './BatchMenuButton';

// One button of the batch bar (Status, Assign, Tags, Copy to phase) with
// the menu it opens.

const meta = {
  title: 'Components/Redesigned/Input manager/Batch menu button',
  tags: ['bo', 'redesigned'],
  component: BatchMenuButton,
  args: {
    icon: 'label',
    label: 'Tags',
    children: () => (
      <OptionList
        options={[
          { value: 'trees', label: 'Trees' },
          { value: 'shade', label: 'Shade', partial: true },
          { value: 'schools', label: 'Schools' },
        ]}
        selected={['trees']}
        onToggle={fn()}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BatchMenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed. */
export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Tags/ })
    );
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: Open.play,
};
