import React, { useState } from 'react';

import { Key } from 'react-aria-components';

import ToggleButton from '../ToggleButton';

import ToggleButtonGroup from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/ToggleButtonGroup',
  component: ToggleButtonGroup,
  args: {
    'aria-label': 'Layout',
    selectedKeys: ['nested'],
    onSelectionChange: () => {},
    children: [
      <ToggleButton key="nested" id="nested">
        Nested
      </ToggleButton>,
      <ToggleButton key="flat" id="flat">
        Flat
      </ToggleButton>,
    ],
  },
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const Example = ({ label, ids }: { label: string; ids: string[] }) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(new Set([ids[0]]));

  return (
    <ToggleButtonGroup
      aria-label={label}
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
    >
      {ids.map((id) => (
        <ToggleButton key={id} id={id}>
          {id}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Example label="Layout" ids={['Nested', 'Flat']} />
      <Example label="Option" ids={['One', 'Two', 'Three']} />
    </div>
  ),
};
