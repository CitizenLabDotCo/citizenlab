import { mockFolderChildAdminPublicationsList } from 'api/admin_publications/__mocks__/data';

import AdminPublicationsCarrousel from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/AdminPublicationsCarrousel',
  component: AdminPublicationsCarrousel,
} satisfies Meta<typeof AdminPublicationsCarrousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'AdminPublicationsCarrousel',
    adminPublications: mockFolderChildAdminPublicationsList,
    hasMore: false,
    onLoadMore: () => new Promise(() => {}),
  },
};
