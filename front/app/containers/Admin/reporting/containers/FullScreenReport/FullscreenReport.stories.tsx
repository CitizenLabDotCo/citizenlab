import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FullScreenReport } from '.';

const meta = {
  title: 'Example/FullScreenReport',
  render: (props) => {
    return (
      <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        <FullScreenReport {...props} />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FullScreenReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ideation: Story = {
  args: {
    reportId: '1',
  },
  parameters: {},
};
