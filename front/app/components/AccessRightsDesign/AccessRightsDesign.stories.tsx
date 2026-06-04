import React from 'react';

import AccessRightsDesign from './';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Test/AccessRightsDesign',
  render: (props) => {
    return (
      <div style={{ width: '720px', maxWidth: '100%' }}>
        <AccessRightsDesign {...props} />
      </div>
    );
  },
} satisfies Meta<typeof AccessRightsDesign>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
