import React from 'react';

import Menu, { MenuItem, MenuTrigger } from '../Menu';

import RichTextToolbar, { RichTextToolbarButton } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Forms/Rich text toolbar',
  component: RichTextToolbar,
  args: { 'aria-label': 'Formatting', children: null },
} satisfies Meta<typeof RichTextToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 442 }}>
      <RichTextToolbar aria-label="Formatting">
        <RichTextToolbarButton icon="bold-14" aria-label="Bold" />
        <RichTextToolbarButton icon="italic-14" aria-label="Italic" />
        <RichTextToolbarButton icon="list-14" aria-label="List" />
        <RichTextToolbarButton
          icon="link-14"
          aria-label="Link"
          isSelected={false}
        />
        <RichTextToolbarButton
          icon="image-14"
          aria-label="Image"
          isSelected={false}
        />
        <RichTextToolbarButton
          icon="square-play-14"
          aria-label="Video"
          isSelected={false}
        />
      </RichTextToolbar>
    </div>
  ),
};

export const ButtonVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <RichTextToolbarButton icon="bold-14" aria-label="Bold" />
      <RichTextToolbarButton icon="bold-14" aria-label="Bold" isSelected />
    </div>
  ),
};

// Every tool the description editor offers. Heading and alignment are menus;
// ordered list and remove formatting show text until Figma draws their icons.
export const AllTools: Story = {
  render: () => (
    <div style={{ width: 442 }}>
      <RichTextToolbar aria-label="Formatting">
        <MenuTrigger>
          <RichTextToolbarButton text="Normal" hasMenu />
          <Menu selectionMode="single" selectedKeys={new Set(['normal'])}>
            <MenuItem id="title">Title</MenuItem>
            <MenuItem id="subtitle">Subtitle</MenuItem>
            <MenuItem id="normal">Normal</MenuItem>
          </Menu>
        </MenuTrigger>
        <RichTextToolbarButton icon="bold-14" aria-label="Bold" />
        <RichTextToolbarButton icon="italic-14" aria-label="Italic" />
        <RichTextToolbarButton
          icon="link-14"
          aria-label="Add link"
          isSelected={false}
        />
        <RichTextToolbarButton text="Add button" isSelected={false} />
        <MenuTrigger>
          <RichTextToolbarButton text="Align left" hasMenu />
          <Menu selectionMode="single" selectedKeys={new Set(['left'])}>
            <MenuItem id="left">Align left</MenuItem>
            <MenuItem id="center">Center text</MenuItem>
            <MenuItem id="right">Align right</MenuItem>
          </Menu>
        </MenuTrigger>
        <RichTextToolbarButton text="1." aria-label="Ordered list" />
        <RichTextToolbarButton icon="list-14" aria-label="Unordered list" />
        <RichTextToolbarButton
          icon="image-14"
          aria-label="Upload image"
          isSelected={false}
        />
        <RichTextToolbarButton
          icon="square-play-14"
          aria-label="Add video"
          isSelected={false}
        />
        <RichTextToolbarButton
          text="Tx"
          aria-label="Remove formatting"
          isSelected={false}
        />
      </RichTextToolbar>
    </div>
  ),
};

export const TextButtonVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <RichTextToolbarButton text="1." aria-label="Ordered list" />
      <RichTextToolbarButton text="1." aria-label="Ordered list" isSelected />
      <RichTextToolbarButton text="Normal" hasMenu />
    </div>
  ),
};
