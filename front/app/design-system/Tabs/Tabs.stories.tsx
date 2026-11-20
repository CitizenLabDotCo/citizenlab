import React, { useState } from 'react';

import { Key } from 'react-aria-components';

import Tabs, { Tab, TabList, TabPanel } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Navigation/Tabs',
  component: Tabs,
  args: { children: null, selectedKey: 'General', onSelectionChange: () => {} },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = ['General', 'Access', 'Notifications', 'Emails'];

const TabsDemo = () => {
  const [selectedKey, setSelectedKey] = useState<Key>('General');

  return (
    <div style={{ width: 560 }}>
      <Tabs selectedKey={selectedKey} onSelectionChange={setSelectedKey}>
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
  );
};

export const Default: Story = {
  render: () => <TabsDemo />,
};
