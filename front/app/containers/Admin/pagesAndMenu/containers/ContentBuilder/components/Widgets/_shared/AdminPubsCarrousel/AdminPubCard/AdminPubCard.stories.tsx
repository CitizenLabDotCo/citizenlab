import { getOrigin } from 'utils/storybook/getOrigin';

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

const image = `${getOrigin()}/images/image16.png`;

export const Primary: Story = {
  args: {
    publicationUrl: '/projects/test',
    publicationTitle: 'Admin pub card',
    imageUrl: image,
    projectCount: 4,
    avatarIds: ['1', '2', '3'],
    onKeyDown: () => {},
  },
};
