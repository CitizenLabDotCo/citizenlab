import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { mockFilterCategories } from '../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import OptionList from './OptionList';

// The checkbox list inside every input manager menu: one row per option
// with an optional colour dot and count, a search field once the list is
// long, and disabled rows with a tooltip saying why.

const statusOptions = mockFilterCategories()[2].options;

const meta = {
  title: 'Components/Redesigned/Input manager/Option list',
  tags: ['bo', 'redesigned'],
  component: OptionList,
  args: {
    options: statusOptions,
    selected: [statusOptions[0].value],
    onToggle: fn(),
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 280,
          padding: 8,
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Statuses with their colour and count, as in the filter menu. */
export const Default: Story = {};

/** Long lists get a search field. */
export const Searchable: Story = {
  args: {
    options: [
      'Trees',
      'Shade',
      'Schools',
      'Mobility',
      'Cycling',
      'Parking',
      'Playgrounds',
      'Lighting',
      'Safety',
      'Water',
    ].map((label) => ({ value: label, label })),
    selected: ['Trees', 'Shade'],
  },
};

/** Batch tags: some selected inputs have the tag, others not. */
export const Partial: Story = {
  args: {
    options: [
      { value: 'trees', label: 'Trees' },
      { value: 'shade', label: 'Shade', partial: true },
      { value: 'schools', label: 'Schools' },
    ],
    selected: ['trees'],
  },
};

/** Automated statuses cannot be picked by hand. */
export const Disabled: Story = {
  args: {
    options: [
      ...statusOptions.slice(0, 2),
      {
        value: 'threshold',
        label: 'Threshold reached',
        color: '#147985',
        disabled: true,
        disabledReason: 'This status is set automatically.',
      },
    ],
  },
};

export const NoMatches: Story = {
  args: Searchable.args,
  play: async ({ canvasElement }) => {
    await userEvent.type(
      within(canvasElement).getByRole('textbox'),
      'zebra crossing'
    );
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
