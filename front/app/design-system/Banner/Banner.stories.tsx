import React from 'react';

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
      <div style={{ width: 444 }}>
        <Banner tone="info" action={{ label: 'Go to project', href: '#' }}>
          Goes live when you publish the project.
        </Banner>
      </div>
      <Banner tone="info">
        Shared with “Collect ideas”. Changes apply to both methods
      </Banner>
      <div style={{ width: 444 }}>
        <Banner
          tone="warning"
          action={{ label: 'Reply to the next input', href: '#' }}
        >
          3 inputs are waiting for your reply.
        </Banner>
      </div>
      <Banner tone="warning">
        3 inputs are waiting for your reply. They stay at the top of the list.
      </Banner>
      <div style={{ width: 444 }}>
        <Banner tone="error" action={{ label: 'Change dates', href: '#' }}>
          Survey overlaps with Ideation.
        </Banner>
      </div>
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
