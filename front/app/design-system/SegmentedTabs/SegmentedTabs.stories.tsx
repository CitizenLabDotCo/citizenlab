import React from 'react';

import { TabPanel } from 'react-aria-components';

import SegmentedTabs, { SegmentedTab, SegmentedTabList } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/SegmentedTabs',
  component: SegmentedTabs,
  args: { children: null },
} satisfies Meta<typeof SegmentedTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SegmentedTabs defaultSelectedKey="build">
      <SegmentedTabList aria-label="Phase view">
        <SegmentedTab id="build">Build</SegmentedTab>
        <SegmentedTab id="manage" isUnread>
          Manage
        </SegmentedTab>
        <SegmentedTab id="insights">Insights</SegmentedTab>
      </SegmentedTabList>
      <TabPanel id="build">Build view</TabPanel>
      <TabPanel id="manage">Manage view</TabPanel>
      <TabPanel id="insights">Insights view</TabPanel>
    </SegmentedTabs>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <SegmentedTabs defaultSelectedKey="one">
        <SegmentedTabList aria-label="Two tabs">
          <SegmentedTab id="one">Tab one</SegmentedTab>
          <SegmentedTab id="two">Tab two</SegmentedTab>
        </SegmentedTabList>
      </SegmentedTabs>
      <SegmentedTabs defaultSelectedKey="one">
        <SegmentedTabList aria-label="Three tabs">
          <SegmentedTab id="one">Tab one</SegmentedTab>
          <SegmentedTab id="two">Tab two</SegmentedTab>
          <SegmentedTab id="three">Tab three</SegmentedTab>
        </SegmentedTabList>
      </SegmentedTabs>
      <SegmentedTabs defaultSelectedKey="one" disabledKeys={['two']}>
        <SegmentedTabList aria-label="Unread and disabled">
          <SegmentedTab id="one" isUnread>
            Tab
          </SegmentedTab>
          <SegmentedTab id="two">Tab</SegmentedTab>
          <SegmentedTab id="three" isUnread>
            Tab
          </SegmentedTab>
        </SegmentedTabList>
      </SegmentedTabs>
    </div>
  ),
};

// Manage looks disabled but stays focusable: Tab or the arrow keys reach it and the
// tooltip says why; clicking it, Space, Enter or arrowing onto it keeps Build selected.
export const DisabledWithReason: Story = {
  render: () => (
    <SegmentedTabs defaultSelectedKey="build">
      <SegmentedTabList aria-label="Phase view">
        <SegmentedTab id="build">Build</SegmentedTab>
        <SegmentedTab
          id="manage"
          disabledReason="Publish the phase to manage its inputs"
        >
          Manage
        </SegmentedTab>
        <SegmentedTab id="insights">Insights</SegmentedTab>
      </SegmentedTabList>
      <TabPanel id="build">Build view</TabPanel>
      <TabPanel id="manage">Manage view</TabPanel>
      <TabPanel id="insights">Insights view</TabPanel>
    </SegmentedTabs>
  ),
};
