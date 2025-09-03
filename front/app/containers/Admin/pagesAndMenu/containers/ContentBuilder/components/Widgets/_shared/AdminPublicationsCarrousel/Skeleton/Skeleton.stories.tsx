import Skeleton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/AdminPublicationCarrouselSkeleton',
  component: Skeleton,
  parameters: {
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'AdminPublicationsCarrousel',
  },
};
