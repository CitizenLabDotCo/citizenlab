import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { mockFilterCategories } from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';
import OptionList from '../OptionList';

import PropertyMenu from './PropertyMenu';

// The picker button of a side panel property, showing the current value
// (with a colour dot for a status), and the menu it opens to change it.

const statusOptions = mockFilterCategories()[2].options;

const meta = {
  title: 'Components/Redesigned/Input manager/Property menu',
  tags: ['bo', 'redesigned'],
  component: PropertyMenu,
  args: {
    label: statusOptions[0].label,
    color: statusOptions[0].color,
    children: (close) => (
      <OptionList
        options={statusOptions}
        selected={[statusOptions[0].value]}
        onToggle={() => close()}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400, minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PropertyMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A status picker, closed. */
export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
  },
};

/** An "add" picker, as for tags and phases. */
export const AddButton: Story = {
  args: {
    label: 'Add tag',
    color: undefined,
    icon: 'plus',
    children: () => (
      <OptionList
        options={mockFilterCategories()[4].options}
        selected={[]}
        searchable
        onToggle={fn()}
      />
    ),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: Open.play,
};
