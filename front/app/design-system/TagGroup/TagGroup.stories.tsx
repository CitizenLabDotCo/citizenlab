import React, { useState } from 'react';

import { Key, TagGroup as AriaTagGroup, TagList } from 'react-aria-components';

import TagGroup, { Tag, TagAdd } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Tag group',
  component: TagGroup,
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const RemovableDistricts = () => {
  const [districts, setDistricts] = useState([
    { id: 'harbour', name: 'Harbour' },
    { id: 'old-town', name: 'Old Town' },
    { id: 'riverside', name: 'Riverside' },
  ]);

  return (
    <div style={{ width: 328 }}>
      <TagGroup
        label="Districts"
        description="Residents filter projects by district."
        items={districts}
        onRemove={(keys: Set<Key>) =>
          setDistricts((current) =>
            current.filter((district) => !keys.has(district.id))
          )
        }
        add={<TagAdd>Add tag</TagAdd>}
      >
        {(district) => <Tag id={district.id}>{district.name}</Tag>}
      </TagGroup>
    </div>
  );
};

export const Default: Story = {
  args: { label: 'Districts', children: null },
  render: () => <RemovableDistricts />,
};

// Removable Yes / No and Default / Disabled. Hover the x, or tab in for Focused.
export const Tags: Story = {
  args: { label: 'Districts', children: null },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <AriaTagGroup
        aria-label="Removable"
        onRemove={() => {}}
        disabledKeys={['disabled']}
      >
        <TagList style={{ display: 'flex', gap: 16 }}>
          <Tag id="default">Harbour</Tag>
          <Tag id="disabled">Harbour</Tag>
        </TagList>
      </AriaTagGroup>
      <AriaTagGroup aria-label="Not removable" disabledKeys={['disabled']}>
        <TagList style={{ display: 'flex', gap: 16 }}>
          <Tag id="default">Harbour</Tag>
          <Tag id="disabled">Harbour</Tag>
        </TagList>
      </AriaTagGroup>
      <div style={{ display: 'flex', gap: 16 }}>
        <TagAdd>Add tag</TagAdd>
        <TagAdd isDisabled>Add tag</TagAdd>
      </div>
    </div>
  ),
};

export const Required: Story = {
  args: { label: 'Districts', children: null },
  render: () => (
    <div style={{ width: 328 }}>
      <TagGroup label="Districts" isRequired add={<TagAdd>Add tag</TagAdd>}>
        <Tag id="harbour">Harbour</Tag>
      </TagGroup>
    </div>
  ),
};
