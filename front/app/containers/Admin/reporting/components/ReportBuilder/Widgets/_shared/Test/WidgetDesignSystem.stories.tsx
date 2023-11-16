import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import WidgetDesignSystem from './WidgetDesignSystem';

const meta = {
  title: 'Example/WidgetDesignSystem',
  render: (props) => {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <WidgetDesignSystem {...props} />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WidgetDesignSystem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ideation: Story = {
  args: {
    backgrounds: false,
  },
  parameters: {},
};
