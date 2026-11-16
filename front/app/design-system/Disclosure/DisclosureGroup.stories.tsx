import React from 'react';

import Badge from '../Badge';

import Disclosure, { DisclosureGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Layout & containers/Disclosure group',
  component: DisclosureGroup,
  args: { children: null },
} satisfies Meta<typeof DisclosureGroup>;

export default meta;

const Body = () => (
  <span
    style={{
      font: '400 12px/16px var(--gv-font-family)',
      color: 'var(--gv-text-secondary)',
    }}
  >
    Participants can submit ideas with a title, a description and images.
  </span>
);
type Story = StoryObj<typeof meta>;

// The Figma example: a required card, an open card, a value the admin chose and an add card.
export const Default: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <DisclosureGroup defaultExpandedKeys={['ideaForm']}>
        <Disclosure id="dates" title="Dates" isRequired>
          <Body />
        </Disclosure>
        <Disclosure id="ideaForm" title="Idea form">
          <Body />
        </Disclosure>
        <Disclosure
          id="views"
          title="Available views"
          summary={<Badge tone="selected">Map</Badge>}
        >
          <Body />
        </Disclosure>
        <Disclosure header="button" title="Attachments" />
      </DisclosureGroup>
    </div>
  ),
};
