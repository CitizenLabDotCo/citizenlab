import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import Card from './Card';

// The bordered card with a title that holds each block of the input
// manager's right column (offline collection, exports).

const meta = {
  title: 'Components/Redesigned/Input manager/Card',
  tags: ['bo', 'redesigned'],
  component: Card,
  args: {
    title: 'Offline collection',
    children: (
      <Text variant="boHelper" m="0">
        Inputs collected on paper or at an event can be added here.
      </Text>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  args: {
    title: 'جمع غير متصل',
    children: (
      <Text variant="boHelper" m="0">
        يمكن إضافة المدخلات التي تم جمعها على الورق هنا.
      </Text>
    ),
  },
  globals: { lang: 'ar' },
};
