import React from 'react';

import Switch from '../Switch';

import Banner from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Banner',
  component: Banner,
  args: {
    children: 'Shared with “Collect ideas”. Changes apply to both methods',
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 764 }}>
      <Banner tone="info">
        Shared with “Collect ideas”. Changes apply to both methods
      </Banner>
      <Banner tone="warning">
        3 inputs are waiting for your reply. They stay at the top of the list.
      </Banner>
      <Banner tone="error">
        Survey overlaps with Ideation. Change the dates of either one.
      </Banner>
      <Banner tone="neutral">
        Konveio keeps the participation data for this document on its own
        platform. Go Vocal only shows the document; responses, comments and
        annotations stay in Konveio and are not part of the exports or the
        insights of this project.
      </Banner>
    </div>
  ),
};

export const WithSwitch: Story = {
  render: () => (
    <div style={{ width: 1180 }}>
      <Banner
        tone="info"
        action={
          <Switch size={28} isSelected>
            New project back office
          </Switch>
        }
        onDismiss={() => {}}
      >
        You are using the new project back office. To go back to the previous
        version, turn it off here or in your profile settings.
      </Banner>
    </div>
  ),
};
