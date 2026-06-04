import React from 'react';

import AccessRightsDesignWienKonto from './AccessRightsDesignWienKonto';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Test/AccessRightsDesignWienKonto',
  render: (props) => {
    return (
      <div style={{ width: '720px', maxWidth: '100%' }}>
        <AccessRightsDesignWienKonto {...props} />
      </div>
    );
  },
} satisfies Meta<typeof AccessRightsDesignWienKonto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
