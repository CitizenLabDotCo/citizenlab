import React from 'react';

import { expect, userEvent, within } from 'storybook/test';
// eslint-plugin-storybook 0.8 knows expect from @storybook/test, not from
// storybook/test (Storybook 10), so it flags every expect here.
/* eslint-disable storybook/use-storybook-expect */

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

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: 'relative', minHeight: '220px' }}>{children}</div>
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
  globals: { lang: 'ar' },
  render: () => (
    <Frame>
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

// Tab moves through the items in order, Shift+Tab back.
export const Keyboard: Story = {
  render: Open.render,
  play: async ({ canvasElement }) => {
    const [rename, duplicate, archive] =
      within(canvasElement).getAllByRole('button');
    await userEvent.tab();
    await expect(rename).toHaveFocus();
    await userEvent.tab();
    await expect(duplicate).toHaveFocus();
    await userEvent.tab();
    await expect(archive).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(duplicate).toHaveFocus();
  },
};
