import React, { ReactNode } from 'react';

import Badge from '../Badge';
import IconButton from '../IconButton';
import Menu, { MenuItem } from '../Menu';
import ReviewStatus from '../ReviewStatus';

import Disclosure from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Layout & containers/Disclosure',
  component: Disclosure,
  args: { title: 'Attachments' },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof Disclosure>;

// Stand-in for the Figma _Slot body.
const Body = () => (
  <span
    style={{
      font: '400 12px/16px var(--gv-font-family)',
      color: 'var(--gv-text-secondary)',
    }}
  >
    Official replies are posted and emailed to the proposer when you publish
    them.
  </span>
);

const Column = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'grid', gap: 24 }}>{children}</div>
);

export const Default: Story = {
  args: { children: <Body /> },
};

export const HeaderDisclosure: Story = {
  render: () => (
    <Column>
      <Disclosure title="Attachments">
        <Body />
      </Disclosure>
      <Disclosure title="Attachments" isDisabled>
        <Body />
      </Disclosure>
    </Column>
  ),
};

export const HeaderButton: Story = {
  render: () => (
    <Column>
      <Disclosure header="button" title="Attachments" actionIcon="plus-16" />
      <Disclosure
        header="button"
        title="Attachments"
        actionIcon="plus-16"
        isDisabled
      />
      <Disclosure
        header="button"
        title="Idea tags"
        actionIcon="chevron-right-16"
        status={<ReviewStatus status="reviewed" />}
        summary={<Badge tone="selected">4 tags</Badge>}
      />
    </Column>
  ),
};

export const HeaderStatic: Story = {
  render: () => (
    <Column>
      <Disclosure
        header="static"
        title="Attachments"
        actions={<IconButton icon="plus-16" aria-label="Add an attachment" />}
      />
      <Disclosure
        header="static"
        title="Attachments"
        actions={<IconButton icon="plus-16" aria-label="Add an attachment" />}
      >
        <Body />
      </Disclosure>
    </Column>
  ),
};

// Every optional slot of the header, in Figma order.
export const Slots: Story = {
  render: () => (
    <Column>
      <Disclosure title="Survey" status={<ReviewStatus status="toReview" />}>
        <Body />
      </Disclosure>
      <Disclosure
        title="Survey options"
        status={<ReviewStatus status="toSet" />}
      >
        <Body />
      </Disclosure>
      <Disclosure title="Input form" summary={<Badge>Idea</Badge>}>
        <Body />
      </Disclosure>
      <Disclosure
        title="Voting method"
        status={<ReviewStatus status="reviewed" />}
        summary={<Badge tone="selected">Budget</Badge>}
      >
        <Body />
      </Disclosure>
      <Disclosure
        title="A very long setting title that has to truncate before anything else does"
        summary={<Badge>Default</Badge>}
      >
        <Body />
      </Disclosure>
    </Column>
  ),
};

export const HeaderMenu: Story = {
  render: () => (
    <Disclosure
      header="menu"
      title="Sorting"
      tooltip="The order ideas are shown in by default."
      status={<ReviewStatus status="toReview" />}
      summary={<Badge>Trending</Badge>}
      menu={
        <Menu
          aria-label="Sorting"
          selectionMode="single"
          selectedKeys={new Set(['trending'])}
        >
          <MenuItem id="trending">Trending</MenuItem>
          <MenuItem id="new">Most recent</MenuItem>
          <MenuItem id="popular">Most reactions</MenuItem>
        </Menu>
      }
    />
  ),
};
