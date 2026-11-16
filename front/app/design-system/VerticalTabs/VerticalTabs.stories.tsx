import React from 'react';

import VerticalTabs, {
  TabPanel,
  VerticalTab,
  VerticalTabList,
  VerticalTabsStyle,
} from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Navigation/Vertical tabs',
  component: VerticalTabs,
  args: { children: null },
} satisfies Meta<typeof VerticalTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = ['General', 'Access', 'Notifications', 'Emails'];

export const Default: Story = {
  render: () => (
    <VerticalTabs defaultSelectedKey="General">
      <VerticalTabList aria-label="Project settings">
        {tabs.map((tab) => (
          <VerticalTab key={tab} id={tab}>
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
  ),
};

const styles: VerticalTabsStyle[] = ['settings', 'rail'];

// Selected, Default and Disabled; then the same with icon and count.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      {styles.map((style) => (
        <div key={style} style={{ width: style === 'rail' ? 175 : undefined }}>
          <VerticalTabs
            style={style}
            defaultSelectedKey="selected"
            disabledKeys={['disabled', 'disabled-icon']}
          >
            <VerticalTabList aria-label="Tabs">
              <VerticalTab id="selected">Notifications</VerticalTab>
              <VerticalTab id="default">Notifications</VerticalTab>
              <VerticalTab id="disabled">Notifications</VerticalTab>
              <VerticalTab id="default-icon" icon="settings-16" count={12}>
                Notifications
              </VerticalTab>
              <VerticalTab id="disabled-icon" icon="settings-16" count={12}>
                Notifications
              </VerticalTab>
            </VerticalTabList>
          </VerticalTabs>
        </div>
      ))}
    </div>
  ),
};

// Access looks disabled but stays focusable: the arrow keys reach it and the tooltip
// says why; clicking it, Space, Enter or arrowing onto it keeps the selection.
export const DisabledWithReason: Story = {
  render: () => (
    <VerticalTabs defaultSelectedKey="General">
      <VerticalTabList aria-label="Project settings">
        {tabs.map((tab) => (
          <VerticalTab
            key={tab}
            id={tab}
            disabledReason={
              tab === 'Access' ? 'Only admins can change access' : undefined
            }
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
  ),
};
