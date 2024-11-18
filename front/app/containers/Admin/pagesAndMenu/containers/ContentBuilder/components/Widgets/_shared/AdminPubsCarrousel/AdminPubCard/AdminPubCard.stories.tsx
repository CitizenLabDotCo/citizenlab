import AdminPubCard from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/AdminPubCard',
  component: AdminPubCard,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof AdminPubCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
