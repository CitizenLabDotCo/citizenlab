import React from 'react';

import Tabs, { Tab, TabList, TabPanel } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Navigation/Tabs',
  component: Tabs,
  args: { children: null },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = ['General', 'Access', 'Notifications', 'Emails'];

export const Default: Story = {
  render: () => (
    <div style={{ width: 560 }}>
      <Tabs defaultSelectedKey="General">
        <TabList aria-label="Settings">
          {tabs.map((tab) => (
            <Tab key={tab} id={tab}>
              {tab}
            </Tab>
          ))}
        </TabList>
        {tabs.map((tab) => (
          <TabPanel key={tab} id={tab}>
            {tab} panel
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ),
};

// Selected, Default, Disabled, each with and without a count.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, width: 560 }}>
      {[false, true].map((showCount) => (
        <Tabs
          key={String(showCount)}
          defaultSelectedKey="selected"
          disabledKeys={['disabled']}
        >
          <TabList aria-label="Tabs">
            <Tab id="selected" count={showCount ? 12 : undefined}>
              Notifications
            </Tab>
            <Tab id="default" count={showCount ? 12 : undefined}>
              Notifications
            </Tab>
            <Tab id="disabled" count={showCount ? 12 : undefined}>
              Notifications
            </Tab>
          </TabList>
        </Tabs>
      ))}
    </div>
  ),
};

// Access looks disabled but stays focusable: the arrow keys reach it and the tooltip
// says why; clicking it, Space, Enter or arrowing onto it keeps the selection.
export const DisabledWithReason: Story = {
  render: () => (
    <div style={{ width: 560 }}>
      <Tabs defaultSelectedKey="General">
        <TabList aria-label="Settings">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              id={tab}
              disabledReason={
                tab === 'Access' ? 'Only admins can change access' : undefined
              }
            >
              {tab}
            </Tab>
          ))}
        </TabList>
        {tabs.map((tab) => (
          <TabPanel key={tab} id={tab}>
            {tab} panel
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ),
};
