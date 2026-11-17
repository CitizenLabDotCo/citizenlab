import React, { useState } from 'react';

import { Key } from 'react-aria-components';

import VerticalTabs, { TabPanel, VerticalTab, VerticalTabList } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Navigation/Vertical tabs',
  component: VerticalTabs,
  args: { children: null, selectedKey: 'General', onSelectionChange: () => {} },
} satisfies Meta<typeof VerticalTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = ['General', 'Access', 'Notifications', 'Emails'];

const VerticalTabsDemo = ({ withIcons = false }: { withIcons?: boolean }) => {
  const [selectedKey, setSelectedKey] = useState<Key>('General');

  return (
    <VerticalTabs selectedKey={selectedKey} onSelectionChange={setSelectedKey}>
      <VerticalTabList>
        {tabs.map((tab) => (
          <VerticalTab
            key={tab}
            id={tab}
            icon={withIcons ? 'settings-16' : undefined}
          >
            {tab}
          </VerticalTab>
        ))}
      </VerticalTabList>
      {tabs.map((tab) => (
        <TabPanel key={tab} id={tab}>
          <div style={{ padding: 16 }}>{tab} panel</div>
        </TabPanel>
      ))}
    </VerticalTabs>
  );
};

export const Default: Story = {
  render: () => <VerticalTabsDemo />,
};

export const WithIcons: Story = {
  render: () => <VerticalTabsDemo withIcons />,
};
