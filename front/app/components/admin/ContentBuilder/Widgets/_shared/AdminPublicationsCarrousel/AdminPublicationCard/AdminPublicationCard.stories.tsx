import { mockFolderChildAdminPublicationsList } from 'api/admin_publications/__mocks__/data';

import { getOrigin } from 'utils/storybook/getOrigin';

import { AdminPublicationCard } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/AdminPublicationCard',
  component: AdminPublicationCard,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof AdminPublicationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const image = `${getOrigin()}/images/image16.png`;

export const Primary: Story = {
  args: {
    adminPublication: mockFolderChildAdminPublicationsList[0],
    imageUrl: image,
    avatarIds: ['1', '2', '3'],
    userCount: 20,
    onKeyDown: () => {},
  },
};
