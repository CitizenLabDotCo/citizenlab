import React from 'react';

import { ListBoxOption } from '../ListBox';

import Select from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Select',
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  'Trending',
  'Most voted',
  'Most discussed',
  'Newest',
  'Oldest',
  'Random',
].map((sort) => (
  <ListBoxOption key={sort} id={sort}>
    {sort}
  </ListBoxOption>
));

export const Default: Story = {
  args: {
    label: 'Sorting',
    placeholder: 'Choose an order',
    description: 'Residents see this first.',
    children: options,
  },
  render: (args) => (
    <div style={{ width: 168 }}>
      <Select {...args} />
    </div>
  ),
};

// Hovered, Pressed and Focused come from the pointer and the keyboard.
const states = [{ name: 'Default' }, { name: 'Invalid', isInvalid: true }];

export const AllVariants: Story = {
  args: { label: 'Sorting', children: options },
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {([36, 32] as const).map((size) =>
        states.map(({ name, isInvalid }) => (
          <div key={`${size}-${name}`} style={{ display: 'flex', gap: 24 }}>
            {[undefined, 'Trending'].map((value) => (
              <div key={value ?? 'placeholder'} style={{ width: 168 }}>
                <Select
                  label="Sorting"
                  placeholder="Choose an order"
                  description="Residents see this first."
                  errorMessage={
                    value
                      ? 'Not available in Map view.'
                      : 'Choose an order to publish.'
                  }
                  size={size}
                  value={value}
                  isInvalid={isInvalid}
                >
                  {options}
                </Select>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  ),
};

// No visible label: the row or a heading already names it.
export const AriaLabelOnly: Story = {
  args: { label: 'Sorting', children: null },
  render: () => (
    <div style={{ width: 168 }}>
      <Select aria-label="Sorting">{options}</Select>
    </div>
  ),
};
