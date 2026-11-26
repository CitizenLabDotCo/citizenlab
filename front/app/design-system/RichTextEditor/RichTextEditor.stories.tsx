import React from 'react';

import RichTextToolbar, { RichTextToolbarButton } from '../RichTextToolbar';

import RichTextEditor from '.';

import type { Meta, StoryObj } from '@storybook/react';

const toolbar = (
  <RichTextToolbar aria-label="Formatting">
    <RichTextToolbarButton
      icon="bold-14"
      aria-label="Bold"
      isSelected={false}
    />
    <RichTextToolbarButton
      icon="italic-14"
      aria-label="Italic"
      isSelected={false}
    />
    <RichTextToolbarButton
      icon="list-14"
      aria-label="List"
      isSelected={false}
    />
    <RichTextToolbarButton icon="link-14" aria-label="Link" />
    <RichTextToolbarButton icon="image-14" aria-label="Image" />
    <RichTextToolbarButton icon="square-play-14" aria-label="Video" />
  </RichTextToolbar>
);

const meta = {
  title: 'Design system/Forms/Rich text editor',
  component: RichTextEditor,
  args: { toolbar, children: null },
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// The body holds a stand-in: the editing engine is not part of the design system.
export const Default: Story = {
  render: () => (
    <div style={{ width: 444 }}>
      <RichTextEditor toolbar={toolbar}>
        <div contentEditable suppressContentEditableWarning />
      </RichTextEditor>
    </div>
  ),
};
