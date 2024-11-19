import AdminPubsCarrousel from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/AdminPubsCarrousel',
  component: AdminPubsCarrousel,
} satisfies Meta<typeof AdminPubsCarrousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
