import React from 'react';

import { ListBoxOption } from '../ListBox';

import ComboBox from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/ComboBox',
  component: ComboBox,
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const people = [
  { id: 'hanne', name: 'Hanne Vos' },
  { id: 'koen', name: 'Koen Peeters' },
  { id: 'lotte', name: 'Lotte Maes' },
  { id: 'jonas', name: 'Jonas Claes' },
  { id: 'sara', name: 'Sara Janssens' },
];

const renderPerson = (person: { id: string; name: string }) => (
  <ListBoxOption id={person.id}>{person.name}</ListBoxOption>
);

export const Default: Story = {
  args: {
    label: 'Manager',
    placeholder: 'Search people',
    description: 'They get the notifications.',
    defaultItems: people,
    children: renderPerson,
  },
  render: (args) => (
    <div style={{ width: 200 }}>
      <ComboBox {...args} />
    </div>
  ),
};

// Hovered, Focused and Open come from the pointer and the keyboard.
const states = [
  { name: 'Default' },
  { name: 'Invalid', isInvalid: true },
  { name: 'Disabled', isDisabled: true },
];

export const AllVariants: Story = {
  args: { label: 'Manager', children: renderPerson },
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {([36, 32] as const).map((size) =>
        states.map(({ name, isInvalid, isDisabled }) => (
          <div key={`${size}-${name}`} style={{ display: 'flex', gap: 24 }}>
            {[undefined, 'hanne'].map((value) => (
              <div key={value ?? 'placeholder'} style={{ width: 200 }}>
                <ComboBox
                  label="Manager"
                  placeholder="Search people"
                  description="They get the notifications."
                  errorMessage="Add a manager to publish."
                  size={size}
                  defaultItems={people}
                  defaultValue={value}
                  isInvalid={isInvalid}
                  isDisabled={isDisabled}
                  isRequired={name === 'Default' && !!value}
                >
                  {renderPerson}
                </ComboBox>
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
  args: { label: 'Manager', children: renderPerson },
  render: () => (
    <div style={{ width: 200 }}>
      <ComboBox
        aria-label="Manager"
        placeholder="Search people"
        defaultItems={people}
      >
        {renderPerson}
      </ComboBox>
    </div>
  ),
};
