import React from 'react';

import Dropdown, { DropdownListItem } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Overlays/Dropdown',
  tags: ['shared'],
  parameters: { gv: {} },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dropdown
      opened={true}
      onClickOutside={() => {}}
      content={
        <>
          <DropdownListItem key={1}>Item 1</DropdownListItem>
          <DropdownListItem key={2}>Item 2</DropdownListItem>
          <DropdownListItem key={3}>Item 3</DropdownListItem>
        </>
      }
    />
  ),
};

const Frame = ({
  children,
  dir,
}: {
  children: React.ReactNode;
  dir?: 'rtl';
}) => (
  <div dir={dir} style={{ position: 'relative', minHeight: '220px' }}>
    {children}
  </div>
);

export const Open: Story = {
  render: () => (
    <Frame>
      <Dropdown
        opened={true}
        onClickOutside={() => {}}
        content={
          <>
            <DropdownListItem>Rename</DropdownListItem>
            <DropdownListItem>Duplicate</DropdownListItem>
            <DropdownListItem>Archive</DropdownListItem>
          </>
        }
      />
    </Frame>
  ),
};

export const Empty: Story = {
  render: () => (
    <Frame>
      <Dropdown
        opened={true}
        onClickOutside={() => {}}
        content={<DropdownListItem>No options available</DropdownListItem>}
      />
    </Frame>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Frame>
      <Dropdown
        opened={true}
        width="240px"
        maxHeight="160px"
        onClickOutside={() => {}}
        content={
          <>
            {Array.from({ length: 12 }, (_, i) => (
              <DropdownListItem key={i}>
                {`Option ${
                  i + 1
                }: a label long enough to wrap onto a second line`}
              </DropdownListItem>
            ))}
          </>
        }
      />
    </Frame>
  ),
};

export const RTL: Story = {
  render: () => (
    <Frame dir="rtl">
      <Dropdown
        opened={true}
        onClickOutside={() => {}}
        content={
          <>
            <DropdownListItem>إعادة تسمية</DropdownListItem>
            <DropdownListItem>نسخ</DropdownListItem>
          </>
        }
      />
    </Frame>
  ),
};
