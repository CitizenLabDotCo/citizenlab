import React, { ReactNode } from 'react';

import Badge from '../Badge';
import Button from '../Button';
import IconButton from '../IconButton';
import ReviewStatus from '../ReviewStatus';
import Switch from '../Switch';

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
      <Disclosure title="Attachments" disabledReason="Publish the phase first">
        <Body />
      </Disclosure>
      <Disclosure title="Attachments" defaultExpanded>
        <Body />
      </Disclosure>
      <Disclosure title="Attachments" defaultExpanded isDisabled>
        <Body />
      </Disclosure>
    </Column>
  ),
};

export const HeaderButton: Story = {
  render: () => (
    <Column>
      <Disclosure header="button" title="Attachments" />
      <Disclosure header="button" title="Attachments" isDisabled />
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
        actions={
          <Button variant="secondary" size={28}>
            Button
          </Button>
        }
      />
      <Disclosure
        header="static"
        title="Attachments"
        isDisabled
        actions={
          <Button variant="secondary" size={28}>
            Button
          </Button>
        }
      />
      <Disclosure
        header="static"
        title="Attachments"
        actions={
          <Button variant="secondary" size={28}>
            Button
          </Button>
        }
      >
        <Body />
      </Disclosure>
      <Disclosure
        header="static"
        title="Attachments"
        isDisabled
        actions={
          <Button variant="secondary" size={28}>
            Button
          </Button>
        }
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
      <Disclosure title="Embed URL" value="Not set">
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
      <Disclosure title="Dates" isRequired>
        <Body />
      </Disclosure>
      <Disclosure
        title="Report"
        header="static"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary">Download</Button>
            <Button variant="primary" icon="plus-16">
              Add a report
            </Button>
          </div>
        }
      />
      <Disclosure
        title="Options to vote on"
        header="static"
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <IconButton icon="plus-16" aria-label="Add an option" />
            <IconButton icon="upload-16" aria-label="Import options" />
            <Button variant="primary">Create form</Button>
          </div>
        }
      />
      <Disclosure
        title="Auto-share results"
        header="static"
        actions={
          <Switch size={26} aria-label="Auto-share results" defaultSelected />
        }
      />
      <Disclosure
        title="A very long setting title that has to truncate before anything else does"
        isRequired
        summary={<Badge>Default</Badge>}
      >
        <Body />
      </Disclosure>
    </Column>
  ),
};
