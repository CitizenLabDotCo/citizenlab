import React, { useState } from 'react';

import TagList, {
  TagListAddField,
  TagListAddSubtag,
  TagListBar,
  TagListBarMode,
  TagListRow,
} from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Tag list',
  component: TagList,
  args: { 'aria-label': 'Tags', children: null },
} satisfies Meta<typeof TagList>;

export default meta;
type Story = StoryObj<typeof meta>;

const frame = { width: 444, display: 'grid', gap: 16 };

export const Row: Story = {
  render: () => (
    <div style={frame}>
      <TagList aria-label="Default">
        <TagListRow id="a" name="Public transport" count="2 subtags" />
      </TagList>
      <TagList aria-label="No count">
        <TagListRow id="a" name="Public transport" />
      </TagList>
      <TagList aria-label="Expanded" defaultExpandedKeys={['a']}>
        <TagListRow id="a" name="Public transport" count="2 subtags">
          <TagListRow id="a1" name="Walking" level="subtag" />
          <TagListRow id="a2" name="Cycling" level="subtag" />
          <TagListAddSubtag id="a-add" onPress={() => {}} />
        </TagListRow>
      </TagList>
      <TagList aria-label="Selected" defaultSelectedKeys={['a']}>
        <TagListRow id="a" name="Public transport" count="2 subtags" />
      </TagList>
      <TagList aria-label="Selected block" defaultSelectedKeys={['a', 'b']}>
        <TagListRow id="a" name="Public transport" count="2 subtags" />
        <TagListRow id="b" name="Parking" />
        <TagListRow id="c" name="Street lighting" />
      </TagList>
      <TagList aria-label="Locked">
        <TagListRow id="other" name="Other" isLocked />
      </TagList>
      <TagList aria-label="Editing">
        <TagListRow id="a" name="Public transport" isEditing />
      </TagList>
      <TagList aria-label="Created">
        <TagListRow
          id="a"
          name="Public transport"
          count="2 subtags"
          isCreated
        />
      </TagList>
      <TagList aria-label="Subtag">
        <TagListRow id="s" name="Walking" level="subtag" />
      </TagList>
      <TagList aria-label="Subtag editing">
        <TagListRow id="s" name="Walking" level="subtag" isEditing />
      </TagList>
      <TagList aria-label="Very long name">
        <TagListRow
          id="l"
          name="A very long tag name that does not fit on one line of the tag list"
          count="12 subtags"
        />
      </TagList>
    </div>
  ),
};

export const AddSubtag: Story = {
  render: () => (
    <div style={frame}>
      <TagList aria-label="Add subtag" defaultExpandedKeys={['a']}>
        <TagListRow id="a" name="Public transport" count="0 subtags">
          <TagListAddSubtag id="a-add" onPress={() => {}} />
        </TagListRow>
      </TagList>
    </div>
  ),
};

const barModes: {
  mode: TagListBarMode;
  label: string;
  isSelected?: boolean;
}[] = [
  { mode: 'count', label: '24 tags' },
  { mode: 'search', label: '2 of 24 tags' },
  { mode: 'selected', label: '23 selected', isSelected: true },
  { mode: 'undo', label: '23 tags deleted' },
  { mode: 'disabled', label: '24 tags' },
];

export const Bar: Story = {
  render: () => (
    <div style={frame}>
      {barModes.map(({ mode, label, isSelected }) => (
        <TagListBar
          key={mode}
          mode={mode}
          label={label}
          isSelected={isSelected}
        />
      ))}
      <TagListBar mode="selected" label="3 selected" isIndeterminate />
    </div>
  ),
};

export const AddField: Story = {
  render: () => (
    <div style={frame}>
      <TagListAddField existingNames={['Parking']} onAdd={() => {}} />
      <TagListAddField
        existingNames={['Parking']}
        onAdd={() => {}}
        defaultValue="Street lighting"
      />
      {/* Press Enter to see Invalid. */}
      <TagListAddField
        existingNames={['Parking']}
        onAdd={() => {}}
        defaultValue="Parking"
      />
    </div>
  ),
};

type Tag = { id: string; name: string; subtags: string[]; isLocked?: boolean };

const initialTags: Tag[] = [
  {
    id: 'transport',
    name: 'Public transport',
    subtags: ['Walking', 'Cycling'],
  },
  { id: 'parking', name: 'Parking', subtags: [] },
  { id: 'lighting', name: 'Street lighting', subtags: [] },
  { id: 'other', name: 'Other', subtags: [], isLocked: true },
];

const InteractiveList = () => {
  const [tags, setTags] = useState(initialTags);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const selectable = tags.filter((t) => !t.isLocked);
  const allSelected = selected.size > 0 && selected.size === selectable.length;

  return (
    <div style={{ width: 444 }}>
      <TagListBar
        mode={selected.size > 0 ? 'selected' : 'count'}
        label={
          selected.size > 0
            ? `${selected.size} selected`
            : `${tags.length} tags`
        }
        isSelected={allSelected}
        isIndeterminate={selected.size > 0 && !allSelected}
        onChange={(on) =>
          setSelected(new Set(on ? selectable.map((t) => t.id) : []))
        }
        onDelete={() => {
          setTags(tags.filter((t) => !selected.has(t.id)));
          setSelected(new Set());
        }}
      />
      <TagList
        aria-label="Tags"
        selectedKeys={selected}
        onSelectionChange={(keys) =>
          setSelected(
            keys === 'all'
              ? new Set(selectable.map((t) => t.id))
              : new Set([...keys].map(String))
          )
        }
      >
        {tags.map((tag) => (
          <TagListRow
            key={tag.id}
            id={tag.id}
            name={tag.name}
            count={`${tag.subtags.length} subtags`}
            isLocked={tag.isLocked}
            isEditing={editing === tag.id}
            isCreated={created === tag.id}
            onRename={() => setEditing(tag.id)}
            onRenameCancel={() => setEditing(null)}
            onRenameSubmit={(name) => {
              setTags(tags.map((t) => (t.id === tag.id ? { ...t, name } : t)));
              setEditing(null);
            }}
            onDelete={() => setTags(tags.filter((t) => t.id !== tag.id))}
          >
            {tag.subtags.map((sub) => (
              <TagListRow
                key={sub}
                id={`${tag.id}-${sub}`}
                name={sub}
                level="subtag"
              />
            ))}
            <TagListAddSubtag id={`${tag.id}-add`} onPress={() => {}} />
          </TagListRow>
        ))}
      </TagList>
      <TagListAddField
        existingNames={tags.map((t) => t.name)}
        onAdd={(name) => {
          const id = `${name}-${Date.now()}`;
          const other = tags.findIndex((t) => t.isLocked);
          const next = [...tags];
          next.splice(other, 0, { id, name, subtags: [] });
          setTags(next);
          setCreated(id);
        }}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveList />,
};
