import { Meta, StoryObj } from '@storybook/react';

import Spinner from './';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: '32px',
    thickness: '3px',
    color: '#666',
  },
};
