import { Meta, StoryObj } from '@storybook/react';

import Success from './';

const meta = {
  title: 'Components/Success',
  component: Success,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Success>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithShortStrings: Story = {
  args: {
    text: 'A Badge with label',
    animate: true,
  },
};
