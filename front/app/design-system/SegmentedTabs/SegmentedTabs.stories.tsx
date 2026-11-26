import React, { useState } from 'react';

import { Key, TabPanel } from 'react-aria-components';

import SegmentedTabs, { SegmentedTab, SegmentedTabList } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/SegmentedTabs',
  component: SegmentedTabs,
  args: { children: null, selectedKey: 'build' },
} satisfies Meta<typeof SegmentedTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const Example = ({
  label,
  tabs,
  withPanels = false,
}: {
  label: string;
  tabs: string[];
  withPanels?: boolean;
}) => {
  const [selectedKey, setSelectedKey] = useState<Key>(tabs[0]);

  return (
    <SegmentedTabs selectedKey={selectedKey} onSelectionChange={setSelectedKey}>
      <SegmentedTabList aria-label={label}>
        {tabs.map((tab) => (
          <SegmentedTab key={tab} id={tab}>
            {tab}
          </SegmentedTab>
        ))}
      </SegmentedTabList>
      {withPanels &&
        tabs.map((tab) => (
          <TabPanel key={tab} id={tab}>
            {tab} view
          </TabPanel>
        ))}
    </SegmentedTabs>
  );
};

export const Default: Story = {
  render: () => (
    <Example
      label="Phase view"
      tabs={['Build', 'Manage', 'Insights']}
      withPanels
    />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Example label="Two tabs" tabs={['Tab one', 'Tab two']} />
      <Example label="Three tabs" tabs={['Tab one', 'Tab two', 'Tab three']} />
    </div>
  ),
};
