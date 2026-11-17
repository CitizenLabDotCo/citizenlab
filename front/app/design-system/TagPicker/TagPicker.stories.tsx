import React, { useState } from 'react';

import { DialogTrigger, Key } from 'react-aria-components';

import { ListBoxOption } from '../ListBox';
import TagGroup, { Tag, TagAdd } from '../TagGroup';

import TagPicker from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Tag picker',
  component: TagPicker,
} satisfies Meta<typeof TagPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const districts = [
  { id: 'harbour', name: 'Harbour' },
  { id: 'old-town', name: 'Old Town' },
  { id: 'northgate', name: 'Northgate' },
  { id: 'riverside', name: 'Riverside' },
  { id: 'westside', name: 'Westside' },
  { id: 'lakeshore', name: 'Lakeshore' },
];

const DistrictsField = () => {
  const [selected, setSelected] = useState<Set<Key>>(
    new Set(['harbour', 'old-town'])
  );

  return (
    <div style={{ width: 328 }}>
      <TagGroup
        label="Districts"
        items={districts.filter((district) => selected.has(district.id))}
        onRemove={(keys: Set<Key>) =>
          setSelected(
            (current) => new Set([...current].filter((key) => !keys.has(key)))
          )
        }
        add={
          <DialogTrigger defaultOpen>
            <TagAdd>Add tag</TagAdd>
            <TagPicker
              aria-label="Districts"
              items={districts}
              selectedKeys={selected}
              onSelectionChange={setSelected}
            >
              {(district) => (
                <ListBoxOption id={district.id}>{district.name}</ListBoxOption>
              )}
            </TagPicker>
          </DialogTrigger>
        }
      >
        {(district) => <Tag id={district.id}>{district.name}</Tag>}
      </TagGroup>
    </div>
  );
};

export const Default: Story = {
  args: {
    'aria-label': 'Districts',
    items: [],
    selectedKeys: new Set(),
    onSelectionChange: () => {},
    children: () => null,
  },
  render: () => <DistrictsField />,
};
