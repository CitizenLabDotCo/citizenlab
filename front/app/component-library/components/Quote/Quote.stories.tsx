import Quote from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Quote',
  component: Quote,
} satisfies Meta<typeof Quote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
